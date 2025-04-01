// src/services/rsaService.ts
import forge from 'node-forge';

export const generateRSAKeys = () => {
  const keypair = forge.pki.rsa.generateKeyPair(2048); // 2048 bits pour une meilleure sécurité
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  
  return {
    privateKey: privateKeyPem,
    publicKey: publicKeyPem
  };
};

/**
 * Fonction pour chiffrer un message avec la clé publique RSA
 * @param publicKeyPem La clé publique en format PEM
 * @param message Le message à chiffrer
 * @returns Le message chiffré en base64
 */
export const encryptMessage = (publicKeyPem: string, message: string): string => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(message, 'RSA-OAEP');
  return forge.util.encode64(encrypted); // Retourne le message chiffré en base64
};


/**
 * Fonction pour déchiffrer un message avec la clé privée RSA
 * @param privateKeyPem La clé privée en format PEM
 * @param encryptedMessage Le message chiffré en base64
 * @returns Le message déchiffré
 */
export const decryptMessage = (privateKeyPem: string, encryptedMessage: string): string => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const decodedMessage = forge.util.decode64(encryptedMessage);
  const decrypted = privateKey.decrypt(decodedMessage, 'RSA-OAEP');
  return decrypted; // Retourne le message déchiffré
}


