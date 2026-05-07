import { storage } from "@/lib/firebase";
import { getBytes, getDownloadURL, ref, uploadBytes } from "firebase/storage";


export const subirImagen = async (path: string, file: any) => {
  const storageRef = ref(storage, `rifas/${path}/${file.name}`);
  const metadata = {
    contentType: file.type,
    cacheControl: 'public,max-age=2592000' // 30 días
  };
  await uploadBytes(storageRef, file, metadata);

  return await obtenerURL(storageRef.fullPath);
};

export const obtenerURL = async (pathFile: string) => {
  const archivoRef = ref(storage, pathFile);
  return await getDownloadURL(archivoRef);
};

export const preLoadImgArrayBuffer = async (pathFile: string = "rifas/6897d4ff9dc798c9280c6c77/mil colones.jpeg") => {
  const archivoRef = ref(storage, pathFile);
  const bytes = await getBytes(archivoRef); // arrayBuffer
  const blob = new Blob([bytes]);
  const imgBitmap = await createImageBitmap(blob); // rápido y compatible con canvas

  // ahora lo puedes dibujar directo
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(imgBitmap, 0, 0);
};
