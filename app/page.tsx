"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stock = {
  id: string;
  totalUnits: number;
  reservedUnits: number;
  warehouseId: string;
  warehouse: {
    name: string;
  };
};

type Product = {
  id: string;
  name: string;
  description: string;
  stocks: Stock[];
};

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function reserve(productId: string, warehouseId: string) {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    });

    const data = await res.json();

    if (res.status === 409) {
      setMessage(data.error);
      return;
    }

    router.push(`/reservations/${data.id}`);
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Inventory Reservation System</h1>

      {message && <div className="mb-4 p-3 bg-gray-200 rounded">{message}</div>}

      <div className="space-y-6">
        {products.map((product) => (
          <div key={product.id} className="border p-5 rounded-xl shadow">
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="mb-4 text-gray-600">{product.description}</p>

            <div className="space-y-3">
              {product.stocks.map((stock) => {
                const available = stock.totalUnits - stock.reservedUnits;

                return (
                  <div key={stock.id} className="border p-3 rounded">
                    <p>
                      <strong>Warehouse:</strong> {stock.warehouse.name}
                    </p>
                    <p>
                      <strong>Available:</strong> {available}
                    </p>

                    <button
                      onClick={() => reserve(product.id, stock.warehouseId)}
                      className="mt-3 bg-black text-white px-4 py-2 rounded"
                    >
                      Reserve
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}