export default async function handler(req, res) {

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

        const [productRes, stockRes] = await Promise.all([

            fetch(
                `https://panel.khfy-store.com/api_v2/list_product?api_key=${process.env.SOURCE_API_KEY}`
            ),

            fetch(
                "https://panel.khfy-store.com/api_v3/cek_stock_akrab"
            )

        ]);

        if (!productRes.ok) {
            throw new Error(`HTTP Error ${productRes.status}`);
        }

        if (!stockRes.ok) {
            throw new Error(`Stock API Error ${stockRes.status}`);
        }

        const productJson = await productRes.json();
        const stockJson = await stockRes.json();

        // =====================
        // MAP STOK XLA
        // =====================

        const stockMap = {};

        stockJson.data.forEach(item => {
            stockMap[item.type] = item.sisa_slot;
        });

        // =====================
        // FILTER XLA & XDA
        // =====================

        const filtered = productJson.data

            .filter(item => {

                const kode = item.kode_produk;
                
                );return (
    /^XLA\d+$/.test(kode) ||
    /^XDA\d+$/.test(kode)
);

            })

            .map(item => {

                // XLA sudah punya API stok
               if (/^XLA\d+$/.test(item.kode_produk)) {

                    return {
                        ...item,
                        sisa_slot: stockMap[item.kode_produk] ?? 0
                    };

                }

                // XDA nanti menyusul
                return {
                    ...item,
                    sisa_slot: null
                };

            });

        // =====================
        // OUTPUT
        // =====================

        return res.status(200).json({

            ok: productJson.ok,

            provider: productJson.provider,

            count: filtered.length,

            data: filtered

        });

    } catch (err) {

        return res.status(500).json({

            ok: false,

            provider: null,

            count: 0,

            data: [],

            message: err.message

        });

    }

}
