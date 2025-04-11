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

export const encryptMessage = (publicKeyPem: string, message: string): string => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  try {
    const encrypted = publicKey.encrypt(message, 'RSA-OAEP');
    if (!encrypted) {
      throw new Error('Erreur lors du chiffrement du message');
    }
    // console.log('Message chiffré:', forge.util.encode64(encrypted));  // Pour débugger
    return forge.util.encode64(encrypted); // Retourne le message chiffré en base64
  } catch (error) {
    console.error('Erreur dans le chiffrement:', error);
    throw error;
  }
};

export const decryptMessage = (privateKeyPem: string, encryptedMessage: string): string => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  try {
    const decodedMessage = forge.util.decode64(encryptedMessage);
    const decrypted = privateKey.decrypt(decodedMessage, 'RSA-OAEP');
    if (!decrypted) {
      throw new Error('Erreur lors du déchiffrement du message');
    }
    // console.log('Message déchiffré:', decrypted);  // Pour débugger
    return decrypted; // Retourne le message déchiffré
  } catch (error) {
    console.error('Erreur dans le déchiffrement:', error);
    throw error;
  }
};
