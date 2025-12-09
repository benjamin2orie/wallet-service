


// src/wallet/paystack.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

type PaystackResponse<T> = {
  status: boolean;
  message?: string;
  data: T;
};

type InitData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

type VerifyData = {
  status: string;
  reference: string;
  amount: number;
  paid_at?: string;
  gateway_response?: string;
  channel?: string;
  currency?: string;
  customer?: any;
  metadata?: any;
};

@Injectable()
export class PaystackService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
  }

  async initialize(email: string, amount: number, reference: string) {
    try {
      const res = await this.axios.post<PaystackResponse<InitData>>(
        '/transaction/initialize',
        { email, amount, reference },
      );

      if (!res.data.status) {
        throw new InternalServerErrorException(res.data.message || 'Paystack init failed');
      }

      return res.data.data;
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.response?.data?.message || 'Paystack initialize request failed',
      );
    }
  }

  async verify(reference: string) {
    try {
      const res = await this.axios.get<PaystackResponse<VerifyData>>(
        `/transaction/verify/${reference}`,
      );

      if (!res.data.status) {
        throw new InternalServerErrorException(res.data.message || 'Paystack verify failed');
      }

      return res.data.data;
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.response?.data?.message || 'Paystack verification request failed',
      );
    }
  }
}




// // src/wallet/paystack.service.ts
// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import fetch from 'node-fetch';

// type PaystackResponse<T> = {
//   status: boolean;
//   message?: string;
//   data: T;
// };

// type InitData = {
//   authorization_url: string;
//   access_code: string;
//   reference: string;
// };

// type VerifyData = {
//   status: string;
//   reference: string;
//   amount: number;
//   paid_at?: string;
//   gateway_response?: string;
//   channel?: string;
//   currency?: string;
//   customer?: any;
//   metadata?: any;
// };

// @Injectable()
// export class PaystackService {
//   private readonly base = 'https://api.paystack.co';

//   private headers() {
//     return {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//     };
//   }

//   async initialize(email: string, amount: number, reference: string) {
//     const res = await fetch(`${this.base}/transaction/initialize`, {
//       method: 'POST',
//       headers: this.headers(),
//       body: JSON.stringify({ email, amount, reference }),
//     });

//     const data = (await res.json()) as PaystackResponse<InitData>;

//     if (!res.ok || !data?.status) {
//       throw new InternalServerErrorException(data?.message ?? 'Paystack init failed');
//     }

//     return data.data; // { authorization_url, access_code, reference }
//   }

//   async verify(reference: string) {
//     const res = await fetch(`${this.base}/transaction/verify/${reference}`, {
//       headers: this.headers(),
//     });

//     const data = (await res.json()) as PaystackResponse<VerifyData>;

//     if (!res.ok || !data?.status) {
//       throw new InternalServerErrorException(data?.message ?? 'Paystack verify failed');
//     }

//     return data.data; // includes status, amount, etc.
//   }
// }
