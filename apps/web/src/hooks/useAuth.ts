import { client } from "@/utils/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData extends SignInData {
  username: string;
}

export const useSignIn = () => {
  const router = useRouter();

  const signInMutation = useMutation({
    mutationFn: async (signInForm: SignInData) => {
      return await client.api.auth.login.$post({
        form: {
          email: signInForm.email,
          password: signInForm.password,
        },
      });
    },
    onSuccess: async (data) => {
      console.log("success! should redirect to browse", await data.json());
      router.push("/browse");
    },
    onError: (error) => {
      router.push("/error");
    },
  });

  return { signInMutation };
};

export const useSignUp = () => {
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: async (signUpForm: SignUpData) => {
      return await client.api.auth.signup.$post({
        form: {
          email: signUpForm.email,
          username: signUpForm.username,
          password: signUpForm.password,
        },
      });
    },
    onSuccess: async (data) => {
      console.log("User signed up successfully", await data.json());
      router.push("/browse");
    },
    onError: () => {
      console.log("something went wrong, router.pushing to error");

      router.push("/error");
    },
  });

  return { signUpMutation };
};

export const useLogOut = () => {
  const router = useRouter();

  const signOutMutation = useMutation({
    mutationFn: async () => {
      return client.api.auth.signout.$post();
    },
    onSuccess: () => {
      router.push("/browse");
    },
    onError: () => {
      router.push("/error");
    },
  });

  return { signOutMutation };
};
