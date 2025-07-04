import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Extend the Profile type for GitHub
interface GitHubProfile {
  id: number;
  login: string;
  node_id: string;
  name: string;
  email: string;
  bio: string;
  company: string;
  location: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  type: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email read:org",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as GitHubProfile;
        
        // Store additional GitHub data
        await db.gitHubAuth.upsert({
          where: {
            userAuthId: account.id,
          },
          update: {
            githubUserId: githubProfile.id.toString(),
            githubUsername: githubProfile.login,
            githubNodeId: githubProfile.node_id,
            name: githubProfile.name,
            bio: githubProfile.bio,
            company: githubProfile.company,
            location: githubProfile.location,
            blog: githubProfile.blog,
            twitterUsername: githubProfile.twitter_username,
            publicRepos: githubProfile.public_repos,
            publicGists: githubProfile.public_gists,
            followers: githubProfile.followers,
            following: githubProfile.following,
            githubCreatedAt: githubProfile.created_at ? new Date(githubProfile.created_at) : null,
            githubUpdatedAt: githubProfile.updated_at ? new Date(githubProfile.updated_at) : null,
            accountType: githubProfile.type,
            scopes: account.scope?.split(",") || [],
          },
          create: {
            userAuthId: account.id,
            githubUserId: githubProfile.id.toString(),
            githubUsername: githubProfile.login,
            githubNodeId: githubProfile.node_id,
            name: githubProfile.name,
            bio: githubProfile.bio,
            company: githubProfile.company,
            location: githubProfile.location,
            blog: githubProfile.blog,
            twitterUsername: githubProfile.twitter_username,
            publicRepos: githubProfile.public_repos,
            publicGists: githubProfile.public_gists,
            followers: githubProfile.followers,
            following: githubProfile.following,
            githubCreatedAt: githubProfile.created_at ? new Date(githubProfile.created_at) : null,
            githubUpdatedAt: githubProfile.updated_at ? new Date(githubProfile.updated_at) : null,
            accountType: githubProfile.type,
            scopes: account.scope?.split(",") || [],
          },
        });

        // Hash and store tokens
        if (account.access_token) {
          const accessTokenHash = await bcrypt.hash(account.access_token, 12);
          await db.userAuth.update({
            where: { id: account.id },
            data: {
              accessTokenHash,
              tokenCreatedAt: new Date(),
              lastUsedAt: new Date(),
            },
          });
        }
      }
      return true;
    },
    async session({ session, user }) {
      // Add user ID to session
      if (session.user) {
        (session.user as any).id = user.id;
        
        // Get GitHub data
        const userAuth = await db.userAuth.findFirst({
          where: { userId: user.id, provider: "GITHUB" },
          include: { githubAuth: true },
        });
        
        if (userAuth?.githubAuth) {
          (session.user as any).github = {
            username: userAuth.githubAuth.githubUsername,
            publicRepos: userAuth.githubAuth.publicRepos,
            followers: userAuth.githubAuth.followers,
          };
        }
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 