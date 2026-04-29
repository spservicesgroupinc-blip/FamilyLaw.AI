const FALLBACK_GAS_URL = 'https://script.google.com/macros/s/AKfycbyC-AXYG1s61nwqrSz726d1_P0rfSOHgSmhG3fIO8t56dqvs9chhrp_gwxeuJjjkb5-/exec';
export const GAS_URL = import.meta.env.VITE_GAS_WEB_APP_URL || FALLBACK_GAS_URL;

console.log("Using GAS_URL:", GAS_URL);

export interface UserSession {
  tenantId: string;
  email: string;
  name: string;
  role: string;
}

class ApiService {
  private async callGas(action: string, payload: any = {}) {
    if (!GAS_URL) {
      throw new Error("VITE_GAS_WEB_APP_URL is not set. Please deploy the Google Apps Script and set the URL in your environment variables.");
    }

    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          // Using text/plain avoids CORS preflight OPTIONS requests which GAS doesn't handle well
          'Content-Type': 'text/plain', 
        },
        body: JSON.stringify({ action, ...payload })
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || data.error || "API request failed");
      }
      return data;
    } catch (error) {
      console.error(`GAS API Error (${action}):`, error);
      throw error;
    }
  }

  // --- AUTH ---
  async login(email: string, password: string): Promise<UserSession> {
    const res = await this.callGas('login', { email, password });
    return { tenantId: res.tenantId, email: res.email, name: res.name, role: res.role };
  }

  async register(email: string, password: string, name: string, role: string): Promise<UserSession> {
    const res = await this.callGas('register', { email, password, name, role });
    return { tenantId: res.tenantId, email: res.email, name: res.name, role: res.role };
  }

  // --- FILES ---
  async uploadFile(tenantId: string, file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const res = await this.callGas('uploadFile', {
            tenantId,
            name: file.name,
            mimeType: file.type,
            base64Data
          });
          resolve(res.file);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async getFiles(tenantId: string): Promise<any[]> {
    const res = await this.callGas('getFiles', { tenantId });
    return res.files;
  }

  async deleteFile(tenantId: string, fileId: string): Promise<void> {
    await this.callGas('deleteFile', { tenantId, fileId });
  }

  // --- RESEARCH ---
  async saveResearch(tenantId: string, query: string, answer: string): Promise<void> {
    await this.callGas('saveResearch', { tenantId, query, answer });
  }

  async getResearch(tenantId: string): Promise<any[]> {
    const res = await this.callGas('getResearch', { tenantId });
    return res.research;
  }

  async saveProfile(tenantId: string, profile: any): Promise<void> {
    await this.callGas('saveProfile', { tenantId, profile });
  }

  async getProfile(tenantId: string): Promise<any> {
    const res = await this.callGas('getProfile', { tenantId });
    return res.profile;
  }
}

export const api = new ApiService();
