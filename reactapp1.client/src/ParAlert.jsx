import React, { useState, useEffect } from "react";
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function ParAlert({ }) {
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);

    //const [cats, setCats] = useState([]);
    //const [sCats, setSCats] = useState([]);

    const [products, setProducts] = useState([]);
    const [belowPar, setBelowPar] = useState([]);
    const [showBelowParAlert, setShowBelowParAlert] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsRes, rulesRes, productsRes] = await Promise.all([
                    fetch("https://localhost:7245/api/item"),
                    fetch("https://localhost:7245/api/parRule"),
                    fetch("https://localhost:7245/api/Product")
                ]);

                if (!itemsRes.ok || !rulesRes.ok || !productsRes.ok) {
                    throw new Error("Failed to fetch one or more resources");
                }

                const [itemsData, rulesData, productsData] = await Promise.all([
                    itemsRes.json(),
                    rulesRes.json(),
                    productsRes.json()
                ]);

                setItems(itemsData);
                setRules(rulesData);
                setProducts(productsData);
                console.log("HEEEERE", JSON.stringify(rulesData, null, 2));
                if (itemsData.length && rulesData.length) {
                    const filtered = itemsData.filter(item => {
                        const matchingRule = rulesData.find(
                            rule => rule.parItemId === item.parItemId && rule.isActive === true
                        );
                        console.log("Matching rule:", matchingRule); // Log matching rule for each item

                        return (
                            matchingRule &&
                            item.totalCount <= matchingRule.parValue && // Make sure this is the correct field
                            item.serialized === false
                        );
                    });
                    setBelowPar(filtered);
                    console.log("Below PAR Items:", filtered);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);


    const getCategoryDescription = (catId) => {
        const cat = cats.find(c => c.catId === catId);
        return cat ? cat.catDesc : catId;
    };

    const getSubCategoryDescription = (subCatId) => {
        const subCat = sCats.find(sc => sc.subCatId === subCatId);
        return subCat ? subCat.subCatDesc : subCatId;
    };


    const getProductName = (parItemId) => {
        const item = items.find(i => i.parItemId === parItemId);
        if (item) {
            const product = products.find(v => v.productId === item.productId)
            return product ? product.name : "No Product Name"; // Display fallback text
        }
        return "No Product Name"; // Fallback if item is not found
    };


    return (
        <div className="p-4">
            {belowPar.length > 0 && (
                <div style={{
                    backgroundColor: 'red',
                    color: 'white',
                    padding: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    label:'SOME ITEMS ARE AT OR BELOW PAR LEVEL'
                }}>
                    <Dialog
                        header="Alert"
                        visible={belowPar.length > 0 && showBelowParAlert}
                        style={{ width: '50vw' }}
                        onHide={() => setShowBelowParAlert(false)}
                        draggable={false}
                        modal
                    >
                        <p style={{ fontWeight: 'bold', color: 'red' }}>SOME ITEMS ARE AT OR BELOW PAR LEVEL:</p>
                        <ul>
                            {belowPar.map((item, index) => (
                                <li key={index}>
                                    {getProductName(item.parItemId)} (Total Count: {item.totalCount})
                                </li>
                            ))}
                        </ul>
                    </Dialog>
                </div>
            )}

        </div>
    );
}

export default ParAlert;