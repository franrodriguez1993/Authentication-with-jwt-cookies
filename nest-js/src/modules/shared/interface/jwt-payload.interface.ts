export interface JWTInterface {
  data: {
    id: string;
  };
  iat: number;
  exp: number;
}

export interface JWTPayloadInterface {
  info: JWTInterface;
  expired: boolean;
  invalid: boolean;
}
