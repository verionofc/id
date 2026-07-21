import { Separator } from "@/components/ui/Separator";

import { SignIn } from "./forms/sign-in";
import { SignUp } from "./forms/sign-up";

import { Ok } from "./ok";
import { AuthProviders } from "./providers";


const AuthComponents = ({ callback }: { callback: string }) => {
  return (
    <AuthProviders
      callbackURL={callback}
      providers={["discord", "github", "google"]}
      actives={{
        discord: false,
        github: true,
        google: false,
      }}
    />
  )
}
export function AuthProviderPage({
  auth,
  callback,
}: AuthProviderProps) {
  switch (auth) {
    case "sign-up":
      return (
        <>
          <AuthComponents callback={callback} />
          <Separator />
          <SignUp callback={callback} />
        </>
      );

    case "ok":
      return <Ok />;

    default:
    return (
      <>
        <AuthComponents callback={callback} />
        <Separator />
        <SignIn callback={callback} />
      </>
    );
  }
}