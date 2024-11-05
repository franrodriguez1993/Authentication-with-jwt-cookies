# Autenticación con JWT y Cookies

En este simple proyecto buscamos crear un sistema simple, pero seguro para el manejo de sesión con jsonwebtoken y cookies.

Tecnologías:
- NestJS
- NextJS

En el back, necesitamos usar las siguientes librerías:
- bcrypt
- jsonwebtoken
- cookie-parser



##  Endpoints básicos

Primero que nada, necesitamos crear 2 endpoints básicos de login y logout.

login:

```
 @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() data: LoginUserDto, @Res() res: Response) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) throw new BadRequestException('Invalid credentials');

    const comparePass = await this.utilService.compare(
      data.password,
      user.password,
    );
    if (!comparePass) throw new BadRequestException('Invalid credentials');

    delete user.password;

    // generate jwt
    const jwt = this.jwtService.createJWT(user._id.toString());
    const refreshToken = this.jwtService.createRefreshJWT(user._id.toString());

    res.cookie('accessToken', jwt, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await this.tokenHistoryService.saveHistory(
      user._id.toString(),
      await this.utilService.encrypt(refreshToken),
    );
    return res.json({
      statusCode: HttpStatus.OK,
      result: { user },
    });
  }

```
Con este endpoint, buscamos chequear que las credenciales del usuario sean válidas y crear 2 tokens que guardaremos en cookies.

- accessToken: Es el token de authorización, es el necesario para realizar cualquier petición en nuestro sistema. Tiene una vida de 5 minutos para mayor seguridad.
- refreshToken: Es el token de larga duración, necesario para poder refrescar el accessToken cuando se vence.

Ambos tokens se guardaran en cookies configuradas como **_httpOnly_**, lo cuál asegura que no puedan ser robadas a través de un script malicioso ejecutado a través de javascript en el navegador. Ademas, en nuestro ejemplo, usamos secure en **_false_** y sameSite en **_lax_** porque estamos trabajando en localhost, de lo contrario, si estuviesemos en producción, deberíamos cambiarlo a **_true_** y **_strict_** respectivamente.

El otro endpoint que vamos a usar es el de logout:

```
@Post('/logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Res() response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return response.json({
      statusCode: HttpStatus.OK,
      message: 'Logout successful',
    });
  }

```
Este elimina las cookies de sesión del navegador una vez que el usuario decide cerrar sesión.



## Autorización, refresco de tokens y seguridad.

Aquí debemos realizar varias configuraciones para que nuestro proyecto envíe y reciba las cookies con los tokens adecuadamente.

Del lado del front, debemos configurar las peticiones que hacemos al backend para que envíen y reciban cookies, usando el header credentials:

```
// /services/user.ts
export const loginUsers = async (data:formLoginInputs) => {
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
      method: 'POST',
      credentials: 'include', // <=== justo aquí
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });
  
  if (!response.ok) {
    throw new Error("Error")
  };
  return await response.json()

}
```
IMPORTANTE: En este caso, estamos usando fetch(), si usáramos axios, deberíamos configurar la propiedad "withCredentials".


En nuestro backend, en el archivo _main.ts_, debemos configurar el cookie-parser:

```
 const PORT = process.env.PORT;

  app.use(cookieParser()); // <== justo aquí
  await app.listen(PORT);
}
bootstrap();
```

Necesitamos un middleware que intercepte cada petición a un endpoint protegido para chequear los tokens en el directorio _src/modules/shared/authentication.guard.ts_

Lo primero que hacemos es obtener las cookies con los tokens:

```
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const accessTokenCookie = request.cookies['accessToken'];
    const refreshTokenCookie = request.cookies['refreshToken'];

```

Luego manejamos los diferentes escenarios que se pueden presentar:

```
      const payload = this.jwtService.decodeJWT(accessTokenCookie, 'access');

      if (payload.invalid) {
        throw new UnauthorizedException('Unauthorized');
      } else if (payload.expired) {
        const { accessToken, refreshToken, userId } =
          await this.renewcredentials(refreshTokenCookie);

        response.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 5 * 60 * 1000, // 5 minutes
        });

        response.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        request.userId = userId;
```
Es posible que recibamos el _accessToken_, pero en el caso de que la cookie ya haya caducado, recibiremos un null, en este caso, procedemos a chequear el _refreshToken_. 
No solo el _accessToken_ es peligroso, sino también el _refreshToken_, si por alguna razón, un atacante logra robar ambos tokens de un usuario, podría realizar peticiones en su nombre, es por eso, que implementamos una pequeña lógica para proteger la autenticidad de los tokens: 

- Cada vez que se genera un nuevo _accessToken_, generamos también un nuevo _refreshToken_.
- Guardamos un registro en mongo con el _refreshToken_ vigente del usuario.

Creamos un schema de mongo donde guardaremos el userId y el refreshToken (encriptado para más seguridad)

```
export class TokenHistory {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  refreshToken: string;
}
```
Este registro, lo vamos a actualizar cada vez que el usuario haga login o que generemos un nuevo __refreshToken_, de esta forma, si un atacante logra hacerse con un _refreshToken_ para realizar una petición haciéndose pasar por el usuario, lo perderá en el momento que se genere un nuevo _accessToken_ o si el usuario legítimo hace una nueva petición. 

Si bien este enfoque no garantiza que los tokens van a estar 100% seguros, permite mitigar en gran parte los ataques de tipo:
- XSS
- CSRF
- man-in-the-middle


