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
  amount?: number;
  college: string;
  createdAt: Date;
  department?: Department;
  dueType: DueType;
  email: string;
  fullName: string;
  hostel?: string;
  matricNumber: string;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  proofUrl: string;
  receiptName?: string;
  reference: string;
  roomNumber?: string;
  status: Status;
  updatedAt: Date;
}

  export interface Transaction {
    amount: number;
    bank: string;
    college: College;
    createdAt: Date;
    department: Department;
    dueType: DueType;
    email: string;
    fullName: string;
    matricNumber: string;
    paymentMethod: PaymentMethod;
    phoneNumber: string;
    proofUrl: string;
    receiptName?: string;
    reference: string;
    status: "Status";
    updatedAt: Date;
  }
  
  export enum Department {
    CHM = "CHM",
    CSC = "CSC",
    MTS = "MTS",
    PHS = "PHS",
    STS = "STS"
}

export enum College {
  COLAMRUD = "COLAMRUD",
  COLANIM = "COLANIM",
  COLBIOS = "COLBIOS",
  COLENDS = "COLENDS",
  COLPHYS = "COLPHYS",
  COLVET = "COLVET",
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