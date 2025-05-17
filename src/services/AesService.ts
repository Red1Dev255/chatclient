
type AesValue = {
  cryptoKey: CryptoKey;
  iv: Uint8Array;
}


// Génère une clé AES 256 bits (CryptoKey)
export const generateAESKey = async (): Promise<CryptoKey> => {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256,
      },
      true, // exportable
      ['encrypt', 'decrypt']
    );
  };
  
  // Génère un IV aléatoire (128 bits)
  export const generateIV = (): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(16));
  };
  
  // Chiffre un message texte en base64
  export const encryptAES = async (
    message: string,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<string> => {
    const encoded = new TextEncoder().encode(message);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      key,
      encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  };
  
  // Déchiffre un message base64 en texte clair
  export const decryptAES = async (
    encryptedBase64: string,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<string> => {
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      encryptedBytes
    );
    return new TextDecoder().decode(decryptedBuffer);
  };
  

  // Exporter la clé AES en base64
export const exportAESKey = async (aesKey: CryptoKey): Promise<string> => {
  const exportedKey = await crypto.subtle.exportKey('raw', aesKey);
  return bufferToBase64(exportedKey);
}

// Exporter l'IV en base64
export const exportIV =(iv: Uint8Array): string => {
  return bufferToBase64(iv);
}

// Utilitaire pour convertir ArrayBuffer en base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary); // Base64 encodé
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const getDecryptedAesValue = async (receivedStringKey: string, receivedStringIV: string): Promise<AesValue> => {
  const aesKeyRaw = base64ToBytes(receivedStringKey);
  const iv = base64ToBytes(receivedStringIV);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    aesKeyRaw,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  return { cryptoKey, iv };
}



