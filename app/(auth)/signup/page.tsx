"use client"
import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from "@/lib/auth-client";
import { toast } from 'sonner'

import Link from 'next/link'
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('pwd') as string;

        try {
            const registrationResult = await authClient.signUp.email({
                name,
                email,
                password,
            });
            
            if (registrationResult.error) {
                throw new Error(registrationResult.error.message)
            }

            setTimeout(() => {
                toast.success("Welcome! Please check your email for verification.")
                setTimeout(() => {
                    console.log("Redirecting to login page...")
                    router.push('/sign-in')
                }, 2500)
            }, 1000)
        } catch (error) {
            console.error('Sign up failed:', error);
        }
    };

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                action=""
                onSubmit={handleSubmit}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            <LogoIcon />
                        </Link>
                        <h1 className="text-title mb-1 mt-4 text-xl font-semibold">Create a Tailark Account</h1>
                        <p className="text-sm">Welcome! Create an account to get started</p>
                    </div>

                    <hr className="my-4 border-dashed" />

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="block text-sm">
                                Name
                            </Label>
                            <Input
                                type="text"
                                required
                                name="name"
                                id="name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="pwd"
                                className="text-title text-sm">
                                Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="pwd"
                                id="pwd"
                                className="input sz-md variant-mixed"
                            />
                        </div>

                        <Button className="w-full">sign up</Button>
                    </div>
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Have an account ?
                        <Button
                            onClick={() => router.push('/sign-in')}
                            asChild
                            variant="link"
                            className="px-2">
                            Sign In
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}