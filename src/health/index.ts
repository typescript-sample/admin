import { Request, Response } from 'express';
const https = require('https')

export type HealthStatus = 'UP' | 'DOWN';
export interface HealthMap {
  [key: string]: Health;
}
export interface Health {
  status: HealthStatus;
  data?: AnyMap;
  details?: HealthMap;
}
export interface AnyMap {
  [key: string]: any;
}
export interface HttpsResult {
  statusCode: number,
  data?: AnyMap,
  statusMessage: string
}


export interface HealthChecker {
  name(): string;
  build(data: AnyMap, error: any): AnyMap;
  check(): Promise<AnyMap>;
}
function getHealth(url: string, timeout: number): Promise<AnyMap> {
  return new Promise((resolve) => {
    https.get(url, { rejectUnauthorized: false }, (res: any) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
      let data = '';
      res.on('data', (d: any) => {
        data += d;
      });

      res.on('end', () => {
        console.log(data)
        resolve({ statusCode: res.statusCode, data: { data }, statusMessage: res.statusMessage })
      });

    }).on('error', (e: any) => {
      let error: AnyMap = { statusCode: 500, statusMessage: e }
      return error
    })

    setTimeout(() => resolve({ statusCode: 408, statusMessage: 'Time out' }), timeout)
  })
}

export class Checker2 {
  timeout: number;
  constructor(private service: string, private url: string, timeout: number) {
    this.timeout = (timeout ? timeout : 4200);
    this.check = this.check.bind(this);
    this.name = this.name.bind(this);
    this.build = this.build.bind(this);
  }
  async check(): Promise<AnyMap> {
    let obj = {} as AnyMap;
    return getHealth(this.url, this.timeout).then(
      r => obj = r
    );

  }
  name(): string {
    return this.service;
  }
  build(data: AnyMap, err: any): AnyMap {
    if (err) {
      if (!data) {
        data = {} as AnyMap;
      }
      data['error'] = err;
    }
    return data;
  }
}





export async function health(checkers: Checker2[]): Promise<Health> {
  const p: Health = { status: 'UP' };
  p.details = {};
  const sub: Health = { status: 'UP' };
  try {
    const r = await checkers[0].check();

    if (r && r.statusCode == 200) {
      sub.status = 'UP';
    }
    if (r && r.statusCode != 200) {
      sub.status = 'DOWN';
      sub.data = r.statusMessage
      p.status = 'DOWN';
    }
    p.details[checkers[0].name()] = { ...sub };

  } catch (err) {
    sub.status = 'DOWN';
    p.status = 'DOWN';
    sub.data = { error: err };
    p.details[checkers[0].name()] = sub;
  }
  return p;
}


export class HealthController2 {
  constructor(protected checkers: Checker2[]) {
    this.check = this.check.bind(this);
  }
  check(req: Request, res: Response) {
    health(this.checkers).then(r => {
      if (r.status === 'UP') {
        return res.status(200).json(r).end();
      } else {
        return res.status(500).json(r).end();
      }
    });
  }
}