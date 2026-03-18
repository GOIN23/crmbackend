export type AttachmentData = {
  fileName: string;
  url: string;
};

export interface UnilateralRefusalData {
  regNumber: string;
  inn: string;
  fullName: string;
  region: string;
  signDate: string | null;
  publishDate: string | null;
  dataParsing: string;
  attachments: AttachmentData[];
}
