import { useEffect, useState } from "react";

import {
  depositToWallet,
  getWalletBalance,
  getWalletTransactions,
} from "../../../api/settings";

import type {
  WalletBalance,
  WalletTransaction,
} from "../../../types/settings";

import "./WalletSettings.css";

function WalletSettings() {
  const [wallet, setWallet] =
    useState<WalletBalance | null>(null);

  const [transactions, setTransactions] =
    useState<WalletTransaction[]>([]);

  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      setLoading(true);
      setError("");

      const [balance, transactionResponse] =
        await Promise.all([
          getWalletBalance(),
          getWalletTransactions(1, 10),
        ]);

      setWallet(balance);
      setTransactions(transactionResponse.items);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Не вдалося завантажити гаманець.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const parsedAmount = Number(
      amount.replace(",", ".")
    );

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Введіть коректну суму.");
      return;
    }

    try {
      setDepositing(true);

      const result = await depositToWallet({
        amount: parsedAmount,
      });

      setWallet({
        balance: result.newBalance,
      });

      setAmount("");

      const transactionResponse =
        await getWalletTransactions(1, 10);

      setTransactions(transactionResponse.items);

      setMessage("Баланс успішно поповнено.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Не вдалося поповнити баланс.");
      }
    } finally {
      setDepositing(false);
    }
  }

  if (loading) {
    return (
      <section className="wallet-settings">
        <div className="wallet-settings-loading">
          Завантаження...
        </div>
      </section>
    );
  }

  return (
    <section className="wallet-settings">
      <div className="wallet-settings-header">
        <h1>Гаманець</h1>
      </div>

      {error && (
        <div className="wallet-settings-message wallet-settings-message-error">
          {error}
        </div>
      )}

      {message && (
        <div className="wallet-settings-message wallet-settings-message-success">
          {message}
        </div>
      )}

      <div className="wallet-settings-balance">
        <span>Мій баланс</span>

        <strong>
          {(wallet?.balance ?? 0).toFixed(2)}₴
        </strong>
      </div>

      <div className="wallet-settings-card">
        <h2>Поповнення балансу</h2>

        <form
          className="wallet-settings-deposit"
          onSubmit={handleDeposit}
        >
          <input
            type="text"
            inputMode="decimal"
            placeholder="Сума"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            disabled={depositing}
          />

          <button
            type="submit"
            disabled={depositing}
          >
            {depositing
              ? "Поповнення..."
              : "Поповнити"}
          </button>
        </form>
      </div>

      <div className="wallet-settings-card">
        <h2>Історія транзакцій</h2>

        {transactions.length === 0 ? (
          <div className="wallet-settings-empty">
            Транзакцій поки немає.
          </div>
        ) : (
          <div className="wallet-settings-transactions">
            <div className="wallet-settings-transaction-header">
              <span>Сума</span>
              <span>Найменування</span>
              <span>Дата</span>
            </div>

            {transactions.map((transaction) => {
              const positive =
                transaction.amount >= 0;

              return (
                <div
                  key={transaction.id}
                  className="wallet-settings-transaction"
                >
                  <span
                    className={
                      positive
                        ? "wallet-transaction-positive"
                        : "wallet-transaction-negative"
                    }
                  >
                    {positive ? "+" : ""}
                    {transaction.amount.toFixed(2)}₴
                  </span>

                  <span>
                    {transaction.title}
                  </span>

                  <span>
                    {new Date(
                      transaction.createdAt
                    ).toLocaleDateString("uk-UA")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default WalletSettings;