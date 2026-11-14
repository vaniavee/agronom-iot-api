"""API kesesuaian lahan INDIKATIF (aturan Juknis Evaluasi Lahan 2011, hukum minimum Liebig).

Jalankan lokal (di folder ini) : py -3.12 -m uvicorn main:app --reload
Dokumentasi interaktif          : http://127.0.0.1:8000/docs
"""
import csv
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

VERSI = "kesesuaian-juknis2011-v1"
URUTAN = ["S1", "S2", "S3", "N"]
KODE = {"suhu": "tc", "ph": "nr", "salinitas": "xc", "curah_hujan": "wa", "lereng": "eh"}   # kode subkelas Juknis
NAMA = {"suhu": "suhu tahunan", "ph": "pH", "salinitas": "salinitas", "curah_hujan": "curah hujan", "lereng": "lereng"}
TIDAK_TERUKUR = "tekstur, drainase, kedalaman tanah, hara hasil laboratorium (N total, P2O5, K2O), KTK, bahan organik, bahaya banjir"
# Rentang masuk akal; di luar ini masukan dianggap anomali dan tidak dinilai.
WAJAR = {"ph": (3.0, 10.0), "ec_us_cm": (0.0, 5000.0), "elevasi_m": (-10.0, 4900.0),
         "lereng_persen": (0.0, 200.0), "curah_hujan_tahunan_mm": (0.0, 10000.0),
         "curah_hujan_masa_tumbuh_mm": (0.0, 10000.0)}


# ---------- mesin aturan ----------
def _cocok(token, v):
    token = token.strip()
    if token.startswith("<"):
        return v < float(token[1:])
    if token.startswith(">"):
        return v > float(token[1:])
    lo, hi = token.split("-")
    return float(lo) <= v <= float(hi)


def muat_syarat(jalur):
    syarat = {}
    with open(jalur, encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            kelas = {k: [t for t in r[k].split(";") if t.strip()] for k in URUTAN}
            syarat.setdefault(r["komoditas"], {})[r["parameter"]] = dict(kelas=kelas, satuan=r["satuan"])
    return syarat


SYARAT = muat_syarat(Path(__file__).with_name("syarat_tumbuh.csv"))


def kelas_parameter(kelas, v):
    """Kelas pertama yang cocok (S1 diutamakan di batas); None bila tidak terdefinisi."""
    for k in URUTAN:
        if any(_cocok(t, v) for t in kelas[k]):
            return k
    return None


def suhu_braak(elevasi_m):
    return 26.3 - 0.01 * elevasi_m * 0.6          # rumus Braak (Juknis 2011)


def _ambil(masukan, param, satuan):
    if param == "curah_hujan":   # periode hujan mengikuti tabel tiap komoditas
        return masukan["hujan_masa_tumbuh"] if "masa pertumbuhan" in satuan else masukan["hujan_tahunan"]
    return masukan.get(param)


def nilai_komoditas(syarat_k, masukan):
    dinilai, tidak = {}, []
    for param, info in syarat_k.items():
        v = _ambil(masukan, param, info["satuan"])
        if v is None:
            tidak.append(param)
            continue
        k = kelas_parameter(info["kelas"], v)
        if k is None:                      # celah rentang di dokumen
            tidak.append(param)
            continue
        dinilai[param] = k
    if not dinilai:
        return dict(kelas=None, subkelas=None, dinilai=dinilai, tidak=tidak)
    terburuk = max(dinilai.values(), key=URUTAN.index)
    pembatas = [p for p, k in dinilai.items() if k == terburuk][:2]               # maksimum dua pembatas
    sub = terburuk if terburuk == "S1" else terburuk + "".join(KODE[p] for p in pembatas)
    return dict(kelas=terburuk, subkelas=sub, dinilai=dinilai, tidak=tidak)


# ---------- model data ----------
class Masukan(BaseModel):
    ph: Optional[float] = Field(None, description="pH tanah (H2O)")
    ec_us_cm: Optional[float] = Field(None, description="Daya hantar listrik dalam uS/cm (dibagi 1000 menjadi salinitas dS/m)")
    elevasi_m: Optional[float] = Field(None, description="Elevasi lokasi (m dpl); dipakai menduga suhu rata-rata tahunan dengan rumus Braak")
    lereng_persen: Optional[float] = Field(None, description="Kemiringan lereng dalam persen")
    curah_hujan_tahunan_mm: Optional[float] = Field(None, description="Curah hujan tahunan (mm); dipakai untuk komoditas yang kriterianya tahunan")
    curah_hujan_masa_tumbuh_mm: Optional[float] = Field(None, description="Curah hujan selama masa pertumbuhan (mm); dipakai untuk komoditas yang kriterianya masa pertumbuhan")


class Komoditas(BaseModel):
    komoditas: str
    kelas: Optional[str] = Field(None, description="S1 sangat sesuai, S2 cukup sesuai, S3 sesuai marginal, N tidak sesuai; kosong bila tidak ada kriteria yang dapat dinilai")
    subkelas: Optional[str] = Field(None, description="Kelas dengan kode pembatas: tc suhu, nr pH, xc salinitas, wa curah hujan, eh lereng")
    kriteria_dinilai: List[str]
    kriteria_tidak_dinilai: List[str]


class Jawaban(BaseModel):
    status: str = Field(description="ok, anomali, atau tidak_ada_masukan")
    salinitas_ds_m: Optional[float] = None
    suhu_tahunan_dugaan_c: Optional[float] = None
    hasil: List[Komoditas]
    anomali: List[str]
    catatan: List[str]
    versi: str


app = FastAPI(title="Agronom IoT Lahan - API Kesesuaian", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/health", operation_id="CekStatus", summary="Cek API hidup")
def health():
    return {"status": "ok", "versi": VERSI, "komoditas": list(SYARAT)}


@app.post("/nilai", response_model=Jawaban, operation_id="NilaiKesesuaian",
          summary="Nilai kesesuaian lahan indikatif untuk satu titik",
          description=("Menilai kesesuaian 7 komoditas (padi sawah irigasi, jagung, kedelai, kacang tanah, ubi kayu, "
                       "cabai merah, tomat sayur) dengan hukum minimum Juknis Evaluasi Lahan 2011. Hanya kriteria yang "
                       "masukannya diberikan yang dinilai. Isi minimal satu masukan. Hasil indikatif, bukan rekomendasi final."))
def nilai(m: Masukan):
    nilai_masuk = m.model_dump()
    ada = {k: v for k, v in nilai_masuk.items() if v is not None}
    anomali = [f"{k}={v} di luar rentang yang masuk akal ({lo} sampai {hi})"
               for k, v in ada.items() for lo, hi in [WAJAR[k]] if not lo <= v <= hi]
    catatan = ["Hasil indikatif berdasarkan aturan Juknis Evaluasi Lahan 2011; bukan rekomendasi final.",
               f"Kriteria yang tidak dinilai karena tidak terukur: {TIDAK_TERUKUR}."]
    dasar = dict(status="ok", salinitas_ds_m=None, suhu_tahunan_dugaan_c=None, hasil=[],
                 anomali=anomali, catatan=catatan, versi=VERSI)
    if anomali:
        dasar["status"] = "anomali"
        catatan.append("Penilaian dihentikan sampai masukan dikonfirmasi.")
        return dasar
    if not ada:
        dasar["status"] = "tidak_ada_masukan"
        catatan.append("Isi minimal satu masukan (pH, EC, elevasi, lereng, atau curah hujan).")
        return dasar

    suhu = suhu_braak(m.elevasi_m) if m.elevasi_m is not None else None
    sal = m.ec_us_cm / 1000.0 if m.ec_us_cm is not None else None
    masukan = dict(ph=m.ph, salinitas=sal, suhu=suhu, lereng=m.lereng_persen,
                   hujan_tahunan=m.curah_hujan_tahunan_mm, hujan_masa_tumbuh=m.curah_hujan_masa_tumbuh_mm)
    if suhu is None:
        catatan.append("Suhu tahunan tidak dinilai karena elevasi tidak diberikan.")
    hasil = {k: nilai_komoditas(s, masukan) for k, s in SYARAT.items()}
    urut = sorted(hasil, key=lambda k: (URUTAN.index(hasil[k]["kelas"]) if hasil[k]["kelas"] else 9,
                                        -len(hasil[k]["dinilai"])))
    dasar["salinitas_ds_m"] = None if sal is None else round(sal, 3)
    dasar["suhu_tahunan_dugaan_c"] = None if suhu is None else round(suhu, 2)
    dasar["hasil"] = [Komoditas(komoditas=k, kelas=hasil[k]["kelas"], subkelas=hasil[k]["subkelas"],
                                kriteria_dinilai=[f"{NAMA[p]}={c}" for p, c in hasil[k]["dinilai"].items()],
                                kriteria_tidak_dinilai=[NAMA[p] for p in hasil[k]["tidak"]]) for k in urut]
    return dasar