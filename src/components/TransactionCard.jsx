import {
  CheckCircle2
} from "lucide-react";

const TransactionCard = () => {
  return (
    <section className="transaction-card">

      <div className="transaction-success-icon">
        <CheckCircle2 size={24} />
      </div>

      <div className="transaction-details">

        <strong>
          Buy data bundle
        </strong>

        <div className="transaction-status">

          <b>
            ₦00.00
          </b>

          <span>
            Successful
          </span>

        </div>

      </div>

      <span className="transaction-time">
        Today 12:45 pm
      </span>

    </section>
  );
};

export default TransactionCard;