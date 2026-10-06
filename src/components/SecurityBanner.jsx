import {
  Phone,
  Wifi,
  ReceiptText,
  CreditCard,
  ShieldCheck,
  Gift,
  List,
  Grid2X2
} from "lucide-react";

import '../styles/securitybanner.css'

const services = [
  {
    name: "Airtime",
    icon: Phone,
    page: "airtime"
  },
  {
    name: "Data",
    icon: Wifi,
    page: "data"
  },
  {
    name: "Bills",
    icon: ReceiptText,
    page: "bills"
  },
  {
    name: "Cards",
    icon: CreditCard,
    page: "cards"
  },
  {
    name: "Fraud Check",
    icon: ShieldCheck,
    page: "fraud"
  },
  {
    name: "Rewards",
    icon: Gift,
    page: "rewards"
  },
  {
    name: "Transactions",
    icon: List,
    page: "transactions"
  },
  {
    name: "More",
    icon: Grid2X2,
    page: "more"
  }
];

const ServicesGrid = ({ setPage }) => {


};

export default ServicesGrid;