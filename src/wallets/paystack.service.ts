// src/wallet/paystack.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

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

  constructor(private config: ConfigService) {
    const secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
    this.axios = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`,
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
        throw new InternalServerErrorException(
          res.data.message || 'Paystack init failed',
        );
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
        throw new InternalServerErrorException(
          res.data.message || 'Paystack verify failed',
        );
      }

      return res.data.data;
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.response?.data?.message ||
          'Paystack verification request failed',
      );
    }
  }
}
