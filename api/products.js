export default async function handler(req, res) {

    // =====================
    // VALIDASI API KEY
    // =====================

    const apiKey = req.query.api_key;

    if (!apiKey) {

        return res.status(400).json({
            ok: false,
            message: "Parameter api_key wajib diisi"
        });

    }

    if (apiKey !== process.env.MY_API_KEY) {

        return res.status(401).json({
            ok: false,
            message: "API Key tidak valid"
        });

    }

    try {

        // =====================
        // AMBIL DATA API ASLI
        // =====================

        const response = await fetch(

            `https://panel.khfy-store.com/api_v2/list_product?api_key=${process.env.SOURCE_API_KEY}`

        );

        if (!response.ok) {

            throw new Error(
                `HTTP Error ${response.status}`
            );

        }

        const json = await response.json();

        // =====================
        // FILTER XLA & XDA
        // =====================

        const filtered = json.data.filter(item => {

            return (

                item.kode_produk.startsWith("XLA")

                ||

                item.kode_produk.startsWith("XDA")

            );

        });

        // =====================
        // OUTPUT SAMA PERSIS
        // =====================

        return res.status(200).json({

            ok: json.ok,

            provider: json.provider,

            count: filtered.length,

            data: filtered

        });

    }

    catch (err) {

        return res.status(500).json({

            ok: false,

            provider: null,

            count: 0,

            data: [],

            message: err.message

        });

    }

}
