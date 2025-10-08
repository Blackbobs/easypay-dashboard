export interface RecentTransaction {
    _id: string;
    email: string;
    amount: number;
    dueType: string;
    status: string;
    createdAt: string;
}

export interface TransactionsResponse {
    data: RecentTransaction[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    message: string;
    success: boolean
  }

  export interface ITransaction  {
    _id: string;
  amount?: number;
  college: string;
  createdAt: Date;
  department?: Department;
  dueType: DueType;
  email: string;
  fullName: string;
  hostel?: string;
  level: string;
  matricNumber: string;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  proofUrl: string;
  receiptName?: string;
  reference: string;
  roomNumber?: string;
  status: Status;
  studentType: string;
  updatedAt: Date;
}

  export interface Transaction {
    _id: string;
    amount: number;
    bank: string;
    college: College;
    createdAt: Date;
    department: Department;
    dueType: DueType;
    email: string;
    fullName: string;
    level: string;
    matricNumber: string;
    paymentMethod: PaymentMethod;
    phoneNumber: string;
    proofUrl: string;
    receiptName?: string;
    reference: string;
    status: "Status";
    studentType: string;
    updatedAt: Date;
  }
  
export enum Department {
  AGAD = "AGAD",
  AEFM = "AEFM",
  ARED = "ARED",
  BCH = "BCH",
  MCB = "MCB",
  PAB = "PAB",
  PAZ = "PAZ",
  ABE = "ABE",
  CVE = "CVE",
  ELE = "ELE",
  MCE = "MCE",
  MTE = "MTE",
  AQFM = "AQFM",
  EMT = "EMT",
  FWM = "FWM",
  WMA = "WMA",
  FST = "FST",
  HSM = "HSM",
  HMT = "HMT",
  NTD = "NTD",
  ETS = "ETS",
  LIS = "LIS",
  CPT = "CPT",
  HRT = "HRT",
  PBST = "PBST",
  PPCP = "PPCP",
  SSLM = "SSLM",
  CSC = "CSC",
  SWE = "SWE",
  IFS = "IFS",
  CYS = "CYS",
  DTS = "DTS",
  IFT = "IFT",
  ICT = "ICT",
  CHM = "CHM",
  MTS = "MTS",
  PHY = "PHY",
  STS = "STS",
  VET = "VET",
  FUMSAA = "FUMSAA",
}
export enum College {
  COLAMRUD = "COLAMRUD",
  COLANIM = "COLANIM",
  COLBIOS = "COLBIOS",
  COLENG = "COLENG",
  COLERM = "COLERM",
  COLENDS = "COLENDS",
  COLPHYS = "COLPHYS",
  COLPLANT = "COLPLANT",
  COLFHEC = "COLFHEC",
  COLCOMP = "COLCOMP",
  COLVET = "COLVET",
  FUMMSA = "FUMMSA",
}

export enum DueType {
  college = "college",
  department = "department",
  hostel = "hostel",
  sug = "sug",
}
export enum PaymentMethod {
  bank_transfer = "bank_transfer",
  card = "card"
}
export enum Status {
  failed = "failed",
  pending = "pending",
  success = "successful"
}