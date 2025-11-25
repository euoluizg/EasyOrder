import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);

  async uploadFile(file: File, path: string): Promise<string> {
    // Cria uma referência (ex: menu/hamburguer-123.jpg)
    const storageRef = ref(this.storage, path);
    
    // Faz o upload
    const snapshot = await uploadBytes(storageRef, file);
    
    // Pega a URL pública
    return await getDownloadURL(snapshot.ref);
  }
}