import nacl from 'tweetnacl';
import utils from 'tweetnacl-util';

class CryptoService {
  constructor() {
    this.keyPair = null;
    this.sharedSecrets = new Map();
    this.messageNonces = new Map();
  }

  generateKeyPair() {
    this.keyPair = nacl.box.keyPair();
    return {
      publicKey: utils.encodeBase64(this.keyPair.publicKey),
      privateKey: utils.encodeBase64(this.keyPair.secretKey),
    };
  }

  getFingerprint(publicKey) {
    const publicKeyBytes = utils.decodeBase64(publicKey);
    const hash = this._sha256(publicKeyBytes);
    return hash.substring(0, 16).toUpperCase();
  }

  encryptMessage(message, recipientPublicKey, ephemeralKeyPair = null) {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const messageBytes = utils.encodeUTF8(message);
    const recipientPublicKeyBytes = utils.decodeBase64(recipientPublicKey);
    const nonce = nacl.randomBytes(24);

    let encryptedBytes;
    let usedEphemeralKey = null;

    if (ephemeralKeyPair) {
      encryptedBytes = nacl.box(
        messageBytes,
        nonce,
        recipientPublicKeyBytes,
        ephemeralKeyPair.secretKey
      );
      usedEphemeralKey = utils.encodeBase64(ephemeralKeyPair.publicKey);
    } else {
      encryptedBytes = nacl.box(messageBytes, nonce, recipientPublicKeyBytes, this.keyPair.secretKey);
    }

    return {
      ciphertext: utils.encodeBase64(encryptedBytes),
      nonce: utils.encodeBase64(nonce),
      ephemeralPublicKey: usedEphemeralKey,
    };
  }

  decryptMessage(ciphertext, nonce, senderPublicKey, ephemeralPublicKey = null) {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const ciphertextBytes = utils.decodeBase64(ciphertext);
    const nonceBytes = utils.decodeBase64(nonce);
    const senderPublicKeyBytes = utils.decodeBase64(senderPublicKey);

    let decryptedBytes;

    if (ephemeralPublicKey) {
      const ephemeralPublicKeyBytes = utils.decodeBase64(ephemeralPublicKey);
      decryptedBytes = nacl.box.open(
        ciphertextBytes,
        nonceBytes,
        ephemeralPublicKeyBytes,
        this.keyPair.secretKey
      );
    } else {
      decryptedBytes = nacl.box.open(ciphertextBytes, nonceBytes, senderPublicKeyBytes, this.keyPair.secretKey);
    }

    if (!decryptedBytes) {
      throw new Error('Decryption failed: corrupted or invalid message');
    }

    return utils.encodeUTF8(decryptedBytes);
  }

  performKeyExchange(recipientPublicKey) {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const ephemeralKeyPair = nacl.box.keyPair();
    const recipientPublicKeyBytes = utils.decodeBase64(recipientPublicKey);

    const sharedSecret = nacl.box(
      new Uint8Array(32),
      new Uint8Array(24),
      recipientPublicKeyBytes,
      ephemeralKeyPair.secretKey
    );

    const exchangeId = this._generateExchangeId();
    this.sharedSecrets.set(exchangeId, {
      sharedSecret: utils.encodeBase64(sharedSecret),
      ephemeralKeyPair,
    });

    return {
      exchangeId,
      ephemeralPublicKey: utils.encodeBase64(ephemeralKeyPair.publicKey),
    };
  }

  enablePerfectForwardSecrecy(conversationId) {
    const ephemeralKeyPair = nacl.box.keyPair();
    this.sharedSecrets.set(conversationId, {
      keyPair: ephemeralKeyPair,
      rotatedAt: Date.now(),
    });
    return utils.encodeBase64(ephemeralKeyPair.publicKey);
  }

  rotateEphemeralKeys(conversationId) {
    const rotationInterval = 60000;
    const currentSecret = this.sharedSecrets.get(conversationId);

    if (currentSecret && Date.now() - currentSecret.rotatedAt > rotationInterval) {
      this.enablePerfectForwardSecrecy(conversationId);
      return true;
    }
    return false;
  }

  encryptLargeMessage(message, recipientPublicKey, chunkSize = 4000) {
    const chunks = [];
    for (let i = 0; i < message.length; i += chunkSize) {
      const chunk = message.substring(i, i + chunkSize);
      chunks.push(this.encryptMessage(chunk, recipientPublicKey));
    }
    return chunks;
  }

  decryptLargeMessage(encryptedChunks, senderPublicKey) {
    let fullMessage = '';
    for (const chunk of encryptedChunks) {
      fullMessage += this.decryptMessage(
        chunk.ciphertext,
        chunk.nonce,
        senderPublicKey,
        chunk.ephemeralPublicKey
      );
    }
    return fullMessage;
  }

  _sha256(data) {
    const array = new Uint8Array(data);
    let hash = 0;
    for (let i = 0; i < array.length; i++) {
      const char = array[i];
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  _generateExchangeId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  wipeAllKeys() {
    this.keyPair = null;
    this.sharedSecrets.clear();
    this.messageNonces.clear();
  }
}

export default new CryptoService();
