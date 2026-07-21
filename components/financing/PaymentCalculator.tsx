"use client";

import { useMemo, useState } from "react";

function calcMonthlyPayment(principal: number, annualRatePct: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / termMonths;
  const payment = (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  return payment;
}

export function PaymentCalculator() {
  const [amount, setAmount] = useState(7000);
  const [rate, setRate] = useState(9.9);
  const [termYears, setTermYears] = useState(5);

  const monthly = useMemo(
    () => calcMonthlyPayment(amount, rate, termYears * 12),
    [amount, rate, termYears]
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="font-display text-2xl font-bold text-navy">
        Estimated Monthly Payment Calculator
      </h2>
      {/* TODO: confirm real financing partner and terms before launch */}
      <p className="mt-2 text-sm text-muted">
        This is an estimate only, not a binding offer. Financing provided
        through our third-party lending partner.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <label htmlFor="loan-amount" className="flex justify-between text-sm font-bold text-navy">
            <span>Loan amount</span>
            <span>${amount.toLocaleString("en-CA")}</span>
          </label>
          <input
            id="loan-amount"
            type="range"
            min={500}
            max={20000}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2 w-full accent-ember"
          />
        </div>

        <div>
          <label htmlFor="loan-rate" className="flex justify-between text-sm font-bold text-navy">
            <span>Estimated annual interest rate</span>
            <span>{rate.toFixed(1)}%</span>
          </label>
          <input
            id="loan-rate"
            type="range"
            min={0}
            max={29.9}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-ember"
          />
        </div>

        <div>
          <label htmlFor="loan-term" className="flex justify-between text-sm font-bold text-navy">
            <span>Loan term</span>
            <span>{termYears} {termYears === 1 ? "year" : "years"}</span>
          </label>
          <input
            id="loan-term"
            type="range"
            min={1}
            max={10}
            step={1}
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
            className="mt-2 w-full accent-ember"
          />
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-navy p-6 text-center text-white">
        <p className="text-sm uppercase tracking-wide text-white/70">
          Estimated monthly payment
        </p>
        <p className="font-display text-4xl font-bold text-ember">
          ${monthly.toFixed(0)}
          <span className="text-lg text-white/70">/mo</span>
        </p>
      </div>
    </div>
  );
}
