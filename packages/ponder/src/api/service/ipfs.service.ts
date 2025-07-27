import { ipfsHost, ipfs } from '@/utils/lib/ipfs';
import { IMetadata } from '../types/metadata.type';

export async function uploadToIPFS(file: File, metadata: IMetadata) {
  const buffer = await file.arrayBuffer();
  let imageCID;

  if (file) {
    const imageResult = await ipfs.add(Buffer.from(buffer));
    imageCID = imageResult.cid.toString();
  }

  const finalMeta = {
    ...metadata,
    image: imageCID ? `ipfs://${imageCID}` : '',
  };

  const metaResult = await ipfs.add(JSON.stringify(finalMeta));
  const metaCID = metaResult.cid.toString();

  return {
    imageCID,
    metadataCID: finalMeta,
    metadataURL: `${ipfsHost}/${metaCID}`,
    imageURL: `${ipfsHost}/${imageCID}`,
  };
}
