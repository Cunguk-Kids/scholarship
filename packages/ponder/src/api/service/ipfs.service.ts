import { ipfsHost, ipfs } from '@/utils/lib/ipfs';
import { IMetadata } from '../types/metadata.type';

export async function uploadToIPFS(file: File, metadata: IMetadata) {
  let imageCID;

  if (file) {
    const buffer = await file?.arrayBuffer();
    const imageResult = await ipfs.add(Buffer.from(buffer), { pin: true });
    imageCID = imageResult.cid.toString();
  }

  const finalMeta = {
    ...metadata,
    image: imageCID ? `ipfs://${imageCID}` : '',
  };

  const metaResult = await ipfs.add(JSON.stringify(finalMeta), { pin: true });
  const metaCID = metaResult.cid.toString();

  return {
    imageCID,
    metaCID,
    metadataURL: `${ipfsHost}/${metaCID}`,
    imageURL: `${ipfsHost}/${imageCID}`,
  };
}
