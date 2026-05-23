"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Reservation = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: string;
  expiresAt: string;
};

export default function ReservationPage() {
  const { id } = useParams();
  const router = useRouter();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [message, setMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReservation(data);
      });
  }, [id]);

  useEffect(() => {
    if (!reservation) return;

    const timer = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor(
          (new Date(reservation.expiresAt).getTime() - Date.now()) / 1000
        )
      );

      setSecondsLeft(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation]);

  async function confirmPurchase() {
    const res = await fetch(`/api/reservations/${id}/confirm`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.status === 410) {
      setMessage(data.error);
      return;
    }

    setReservation(data);
    setMessage("Reservation confirmed successfully");
  }

  async function cancelReservation() {
    const res = await fetch(`/api/reservations/${id}/release`, {
      method: "POST",
    });

    const data = await res.json();

    setReservation(data);
    setMessage("Reservation cancelled");
  }

  if (!reservation) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Checkout Reservation
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-gray-200 rounded">
          {message}
        </div>
      )}

      <div className="border rounded-xl p-5 shadow space-y-3">
        <p>
          <strong>Reservation ID:</strong> {reservation.id}
        </p>

        <p>
          <strong>Product:</strong> {reservation.productId}
        </p>

        <p>
          <strong>Warehouse:</strong> {reservation.warehouseId}
        </p>

        <p>
          <strong>Quantity:</strong> {reservation.quantity}
        </p>

        <p>
          <strong>Status:</strong> {reservation.status}
        </p>

        <p>
          <strong>Expires in:</strong> {secondsLeft} seconds
        </p>

        <div className="flex gap-3 pt-4">
          <button
            onClick={confirmPurchase}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Confirm purchase
          </button>

          <button
            onClick={cancelReservation}
            className="bg-red-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}