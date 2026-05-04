import { useState, useCallback, useEffect } from 'react';
import cryptoService from '../services/cryptoService';

const useCrypto = () => {
  const [keyPair, setKeyPair] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptionError, setEncryptionError] = useState(null);

  const initializeKeys = useCallback(() => {
    try {
      const keys = cryptoService.generateKeyPair();
      setKeyPair(keys);

      const fp = cryptoService.getFingerprint(keys.publicKey);
      setFingerprint(fp);

      localStorage.setItem('vault_publicKey', keys.publicKey);
      localStorage.setItem('vault_privateKey', keys.privateKey);
      localStorage.setItem('vault_fingerprint', fp);

      return { keys, fingerprint: fp };
    } catch (error) {
      setEncryptionError(error.message);
      return null;
    }
  }, []);

  const loadKeysFromStorage = useCallback(() => {
    try {
      const storedPublicKey = localStorage.getItem('vault_publicKey');
      const storedPrivateKey = localStorage.getItem('vault_privateKey');
      const storedFingerprint = localStorage.getItem('vault_fingerprint');

      if (storedPublicKey && storedPrivateKey) {
        setKeyPair({
          publicKey: storedPublicKey,
          privateKey: storedPrivateKey,
        });
        setFingerprint(storedFingerprint);
        return true;
      }
      return false;
    } catch (error) {
      setEncryptionError(error.message);
      return false;
    }
  }, []);

  const encryptMessage = useCallback(async (message, recipientPublicKey, useEphemeral = true) => {
    setIsEncrypting(true);
    setEncryptionError(null);
    try {
      let ephemeralKeyPair = null;
      if (useEphemeral) {
        const exchange = cryptoService.performKeyExchange(recipientPublicKey);
        ephemeralKeyPair = cryptoService.sharedSecrets.get(exchange.exchangeId)?.ephemeralKeyPair;
      }

      const encrypted = cryptoService.encryptMessage(message, recipientPublicKey, ephemeralKeyPair);
      setIsEncrypting(false);
      return encrypted;
    } catch (error) {
      setEncryptionError(error.message);
      setIsEncrypting(false);
      throw error;
    }
  }, []);

  const decryptMessage = useCallback(async (ciphertext, nonce, senderPublicKey, ephemeralPublicKey = null) => {
    setIsDecrypting(true);
    setEncryptionError(null);
    try {
      const decrypted = cryptoService.decryptMessage(ciphertext, nonce, senderPublicKey, ephemeralPublicKey);
      setIsDecrypting(false);
      return decrypted;
    } catch (error) {
      setEncryptionError(error.message);
      setIsDecrypting(false);
      throw error;
    }
  }, []);

  const getFingerprint = useCallback((publicKey) => {
    try {
      return cryptoService.getFingerprint(publicKey);
    } catch (error) {
      setEncryptionError(error.message);
      return null;
    }
  }, []);

  const wipeKeys = useCallback(() => {
    try {
      cryptoService.wipeAllKeys();
      setKeyPair(null);
      setFingerprint(null);
      localStorage.removeItem('vault_publicKey');
      localStorage.removeItem('vault_privateKey');
      localStorage.removeItem('vault_fingerprint');
      return true;
    } catch (error) {
      setEncryptionError(error.message);
      return false;
    }
  }, []);

  useEffect(() => {
    loadKeysFromStorage();
  }, [loadKeysFromStorage]);

  return {
    keyPair,
    fingerprint,
    isEncrypting,
    isDecrypting,
    encryptionError,
    initializeKeys,
    loadKeysFromStorage,
    encryptMessage,
    decryptMessage,
    getFingerprint,
    wipeKeys,
  };
};

export default useCrypto;
