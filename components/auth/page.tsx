import { Separator } from "@/components/ui/Separator";

import { SignIn } from "./forms/sign-in";
import { SignUp } from "./forms/sign-up";

import { Ok } from "./ok";
import { AuthProviders } from "./providers";

export function AuthProviderPage({
  auth,
  callback,
}: AuthProviderProps) {
  switch (auth) {
    case "sign-up":
      return (
        <>
          <Separator />
          <SignUp callback={callback} />
        </>
      );

    case "ok":
      return <Ok />;

    default:
    return (
      <>
        <AuthProviders
          callbackURL={callback}
          providers={["github", "google"]}
          actives={{
            github: true,
            google: false,
          }}
        />
        <Separator />
        <SignIn callback={callback} />
      </>
    );
  }
}