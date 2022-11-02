import { Response } from 'express';

export function sendErrorResponse(status: number, message: string | object, res: Response) {
  if (typeof message === 'string') {
    return res.status(status).json({ message });
  }
  if (typeof message === 'object') {
    return res.status(status).json(message);
  }
}

export function sendSuccessResponse<T>(message: string, data: T, res: Response) {
  return res.status(200).json({ message, data });
}

export function getEnv(envStr: string): string {
  if (
    Object.keys(process.env).includes(envStr)

  ) {
    return process.env[envStr]!;

  } else throw Error(envStr + '\s is not DEFINED')

}