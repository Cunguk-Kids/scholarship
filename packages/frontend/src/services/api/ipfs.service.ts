/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/util/api';

type UploadPayload = {
  file?: File;
  meta?: Record<string, any>;
};

type UploadResponse = {
  imageCID: string;
  metaCID: string;
  imageURL: string;
  metadataURL: string;
};

export async function uploadToIPFS({ file, meta }: UploadPayload): Promise<UploadResponse> {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }

  if (meta) {
    for (const [key, value] of Object.entries(meta)) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  }

  const response = await api.post('/ipfs/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
