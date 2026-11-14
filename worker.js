// worker.js: API kesesuaian lahan indikatif untuk Cloudflare Workers.
// DIBUAT OTOMATIS oleh buat_worker.py dari syarat_tumbuh.csv. Jangan diedit manual.
const SYARAT = {"padi_sawah_irigasi": {"suhu": {"satuan": "C rata-rata tahunan", "kelas": {"S1": ["24-29"], "S2": ["22-24", "29-32"], "S3": ["18-22", "32-35"], "N": ["<18", ">35"]}}, "ph": {"satuan": "H2O", "kelas": {"S1": ["5.5-7.0"], "S2": ["4.5-5.5", "7.0-8.0"], "S3": ["<4.5", ">8.0"], "N": []}}, "salinitas": {"satuan": "dS/m", "kelas": {"S1": ["<2"], "S2": ["2-4"], "S3": ["4-6"], "N": [">6"]}}, "lereng": {"satuan": "%", "kelas": {"S1": ["<3"], "S2": ["3-5"], "S3": ["5-8"], "N": [">8"]}}}, "jagung": {"suhu": {"satuan": "C rata-rata tahunan", "kelas": {"S1": ["20-26"], "S2": ["26-30"], "S3": ["16-20", "30-32"], "N": ["<16", ">32"]}}, "ph": {"satuan": "H2O", "kelas": {"S1": ["5.8-7.8"], "S2": ["5.5-5.8", "7.8-8.2"], "S3": ["<5.5", ">8.2"], "N": []}}, "salinitas": {"satuan": "dS/m", "kelas": {"S1": ["<4"], "S2": ["4-6"], "S3": ["4-8"], "N": [">8"]}}, "curah_hujan": {"satuan": "mm per tahun", "kelas": {"S1": ["900-1200"], "S2": ["1200-1600", "500-900"], "S3": [">1600", "300-500"], "N": ["<300"]}}, "lereng": {"satuan": "%", "kelas": {"S1": ["<3"], "S2": ["3-8"], "S3": ["8-15"], "N": [">15"]}}}, "kedelai": {"suhu": {"satuan": "C rata-rata tahunan", "kelas": {"S1": ["23-25"], "S2": ["20-23", "25-28"], "S3": ["18-20", "28-32"], "N": ["<18", ">32"]}}, "ph": {"satuan": "H2O", "kelas": {"S1": ["5.5-7.5"], "S2": ["5.0-5.5", "7.5-7.8"], "S3": ["<5.0", ">7.8"], "N": []}}, "salinitas": {"satuan": "dS/m", "kelas": {"S1": ["<4"], "S2": ["4-6"], "S3": ["6-8"], "N": [">8"]}}, "curah_hujan": {"satuan": "mm masa pertumbuhan", "kelas": {"S1": ["350-1100"], "S2": ["250-350", "1100-1600"], "S3": ["180-250", "1600-1900"], "N": ["<180", ">1900"]}}, "lereng": {"satuan": "%", "kelas": {"S1": ["<3"], "S2": ["3-8"], "S3": ["8-15"], "N": [">15"]}}}, "kacang_tanah": {"suhu": {"satuan": "C rata-rata tahunan", "kelas": {"S1": ["25-27"], "S2": ["20-25", "27-30"], "S3": ["18-20", "30-34"], "N": ["<18", ">34"]}}, "ph": {"satuan": "H2O", "kelas": {"S1": ["6.0-7.0"], "S2": ["5.0-6.0", "7.0-7.5"], "S3": ["<5.0", ">7.5"], "N": []}}, "salinitas": {"satuan": "dS/m", "kelas": {"S1": ["<4"], "S2": ["4-6"], "S3": ["6-8"], "N": [">8"]}}, "curah_hujan": {"satuan": "mm masa pertumbuhan", "kelas": {"S1": ["400-1100"], "S2": ["1100-1600", "300-400"], "S3": ["1600-1900", "200-300"], "N": [">1900", "<200"]}}, "lereng": {"satuan": "%", "kelas": {"S1": ["<3"], "S2": ["3-8"], "S3": ["8-15"], "N": [">15"]}}}, "ubi_kayu": {"suhu": {"satuan": "C rata-rata tahunan", "kelas": {"S1": ["22-28"], "S2": ["28-30"], "S3": ["18-20", "30-35"], "N": ["<18", ">35"]}}, "ph": {"satuan": "H2O", "kelas": {"S1": ["5.2-7.0"], "S2": ["4.8-5.2", "7.0-7.6"], "S3": ["<4.8", ">7.6"], "N": []}}, "salinitas": {"satuan": "dS/m", "kelas": {"S1": ["<2"], "S2": ["2-3"], "S3": ["3-4"], "N": [">4"]}}, "curah_hujan": {"satuan": "mm per tahun", "kelas": {"S1": ["1000-2000"], "S2": ["600-1000", "2000-3000"], "S3": ["500-600", "3000-4000"], "N": ["<500", ">4000"]}}, "lereng": {"satuan": "%", "kelas": {"S1": ["<3"], "S2": ["3-8"], "S3": ["8-15"], "N": [">15"]}}}, "cabai_merah": {"suhu": {"satuan": "C rata-rata tahunan", "kelas": {"S1": ["21-27"], "S2": ["27-28", "16-21"], "S3": ["28-30", "14-16"], "N": [">30", "<14"]}}, "ph": {"satuan": "H2O", "kelas": {"S1": ["6.0-7.6"], "S2": ["5.5-6.0", "7.6-8.0"], "S3": ["<5.5", ">8.0"], "N": []}}, "salinitas": {"satuan": "dS/m", "kelas": {"S1": ["<3"], "S2": ["3-5"], "S3": ["5-7"], "N": [">7"]}}, "curah_hujan": {"satuan": "mm (periode tidak disebut; diasumsikan tahunan)", "kelas": {"S1": ["600-1200"], "S2": ["500-600", "1200-1400"], "S3": ["400-500", ">1400"], "N": ["<400"]}}, "lereng": {"satuan": "%", "kelas": {"S1": ["<3"], "S2": ["3-8"], "S3": ["8-15"], "N": [">15"]}}}, "tomat_sayur": {"suhu": {"satuan": "C rata-rata tahunan", "kelas": {"S1": ["18-26"], "S2": ["26-30", "16-18"], "S3": ["30-35", "13-16"], "N": [">35", "<13"]}}, "ph": {"satuan": "H2O", "kelas": {"S1": ["6.0-7.5"], "S2": ["5.5-6.0", "7.5-8.0"], "S3": ["<5.5", ">8.0"], "N": []}}, "salinitas": {"satuan": "dS/m", "kelas": {"S1": ["<5"], "S2": ["5-8"], "S3": ["8-10"], "N": [">10"]}}, "curah_hujan": {"satuan": "mm masa pertumbuhan", "kelas": {"S1": ["400-700"], "S2": ["700-800", "300-400"], "S3": [">800", "200-300"], "N": ["<200"]}}, "lereng": {"satuan": "%", "kelas": {"S1": ["<3"], "S2": ["3-8"], "S3": ["8-15"], "N": [">15"]}}}};

const VERSI = "kesesuaian-juknis2011-v1";
const URUTAN = ["S1", "S2", "S3", "N"];
const KODE = { suhu: "tc", ph: "nr", salinitas: "xc", curah_hujan: "wa", lereng: "eh" };
const NAMA = { suhu: "suhu tahunan", ph: "pH", salinitas: "salinitas", curah_hujan: "curah hujan", lereng: "lereng" };
const TIDAK_TERUKUR = "tekstur, drainase, kedalaman tanah, hara hasil laboratorium (N total, P2O5, K2O), KTK, bahan organik, bahaya banjir";
const WAJAR = { ph: [3.0, 10.0], ec_us_cm: [0.0, 5000.0], elevasi_m: [-10.0, 4900.0], lereng_persen: [0.0, 200.0],
                curah_hujan_tahunan_mm: [0.0, 10000.0], curah_hujan_masa_tumbuh_mm: [0.0, 10000.0] };
const FIELD = Object.keys(WAJAR);
const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS",
               "access-control-allow-headers": "*" };

const pyNum = n => (Number.isInteger(n) ? n.toFixed(1) : String(n));      // tampilan angka seperti Python
const bulat = (x, d) => Number(x.toFixed(d));

function cocok(tok, v) {
  tok = tok.trim();
  if (tok[0] === "<") return v < parseFloat(tok.slice(1));
  if (tok[0] === ">") return v > parseFloat(tok.slice(1));
  const [lo, hi] = tok.split("-").map(parseFloat);
  return v >= lo && v <= hi;
}
function kelasParameter(kelas, v) {
  for (const k of URUTAN) if (kelas[k].some(t => cocok(t, v))) return k;
  return null;
}
const suhuBraak = el => 26.3 - 0.01 * el * 0.6;
function ambil(masukan, param, satuan) {
  if (param === "curah_hujan") return satuan.includes("masa pertumbuhan") ? masukan.hujan_masa_tumbuh : masukan.hujan_tahunan;
  return masukan[param];
}
function nilaiKomoditas(syaratK, masukan) {
  const dinilai = {}, tidak = [];
  for (const [param, info] of Object.entries(syaratK)) {
    const v = ambil(masukan, param, info.satuan);
    if (v === null || v === undefined) { tidak.push(param); continue; }
    const k = kelasParameter(info.kelas, v);
    if (k === null) { tidak.push(param); continue; }
    dinilai[param] = k;
  }
  const nama = Object.keys(dinilai);
  if (!nama.length) return { kelas: null, subkelas: null, dinilai, tidak };
  const terburuk = nama.map(p => dinilai[p]).reduce((a, b) => (URUTAN.indexOf(b) > URUTAN.indexOf(a) ? b : a));
  const pembatas = nama.filter(p => dinilai[p] === terburuk).slice(0, 2);
  const sub = terburuk === "S1" ? "S1" : terburuk + pembatas.map(p => KODE[p]).join("");
  return { kelas: terburuk, subkelas: sub, dinilai, tidak };
}

function nilai(m) {
  const ada = FIELD.filter(k => m[k] !== null);
  const anomali = ada.filter(k => !(WAJAR[k][0] <= m[k] && m[k] <= WAJAR[k][1]))
    .map(k => `${k}=${pyNum(m[k])} di luar rentang yang masuk akal (${pyNum(WAJAR[k][0])} sampai ${pyNum(WAJAR[k][1])})`);
  const catatan = ["Hasil indikatif berdasarkan aturan Juknis Evaluasi Lahan 2011; bukan rekomendasi final.",
                   `Kriteria yang tidak dinilai karena tidak terukur: ${TIDAK_TERUKUR}.`];
  const dasar = { status: "ok", salinitas_ds_m: null, suhu_tahunan_dugaan_c: null, hasil: [], anomali, catatan, versi: VERSI };
  if (anomali.length) {
    dasar.status = "anomali"; catatan.push("Penilaian dihentikan sampai masukan dikonfirmasi."); return dasar;
  }
  if (!ada.length) {
    dasar.status = "tidak_ada_masukan"; catatan.push("Isi minimal satu masukan (pH, EC, elevasi, lereng, atau curah hujan)."); return dasar;
  }
  const suhu = m.elevasi_m !== null ? suhuBraak(m.elevasi_m) : null;
  const sal = m.ec_us_cm !== null ? m.ec_us_cm / 1000 : null;
  const masukan = { ph: m.ph, salinitas: sal, suhu, lereng: m.lereng_persen,
                    hujan_tahunan: m.curah_hujan_tahunan_mm, hujan_masa_tumbuh: m.curah_hujan_masa_tumbuh_mm };
  if (suhu === null) catatan.push("Suhu tahunan tidak dinilai karena elevasi tidak diberikan.");
  const hasil = {};
  for (const [k, s] of Object.entries(SYARAT)) hasil[k] = nilaiKomoditas(s, masukan);
  const urut = Object.keys(hasil).sort((a, b) => {
    const ka = hasil[a].kelas ? URUTAN.indexOf(hasil[a].kelas) : 9, kb = hasil[b].kelas ? URUTAN.indexOf(hasil[b].kelas) : 9;
    return ka - kb || Object.keys(hasil[b].dinilai).length - Object.keys(hasil[a].dinilai).length;
  });
  dasar.salinitas_ds_m = sal === null ? null : bulat(sal, 3);
  dasar.suhu_tahunan_dugaan_c = suhu === null ? null : bulat(suhu, 2);
  dasar.hasil = urut.map(k => ({
    komoditas: k, kelas: hasil[k].kelas, subkelas: hasil[k].subkelas,
    kriteria_dinilai: Object.entries(hasil[k].dinilai).map(([p, c]) => `${NAMA[p]}=${c}`),
    kriteria_tidak_dinilai: hasil[k].tidak.map(p => NAMA[p]) }));
  return dasar;
}

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json; charset=utf-8", ...CORS } });

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (request.method === "GET" && pathname === "/health")
      return json({ status: "ok", versi: VERSI, komoditas: Object.keys(SYARAT) });
    if (request.method === "GET" && pathname === "/")
      return json({ layanan: "Agronom IoT Lahan - API Kesesuaian", gunakan: "POST /nilai", cek: "GET /health" });
    if (request.method === "POST" && pathname === "/nilai") {
      let badan;
      try { badan = await request.json(); } catch (e) { badan = null; }
      if (badan === null || typeof badan !== "object" || Array.isArray(badan))
        return json({ detail: [{ loc: ["body"], msg: "Input should be a valid dictionary", type: "model_attributes_type" }] }, 422);
      const m = {}, salah = [];
      for (const k of FIELD) {
        let v = badan[k];
        if (v === undefined || v === null) { m[k] = null; continue; }
        if (typeof v === "string" && v.trim() !== "") v = Number(v);
        if (typeof v !== "number" || !Number.isFinite(v)) {
          salah.push({ loc: ["body", k], msg: "Input should be a valid number", type: "float_parsing" }); continue;
        }
        m[k] = v;
      }
      if (salah.length) return json({ detail: salah }, 422);
      return json(nilai(m));
    }
    return json({ detail: "Not Found" }, 404);
  }
};