import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import axios from "axios";

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
  adapter: PrismaAdapter(db),
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
      // No upsert here! Only allow sign in.
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;

        // Check if we already have GitHub data
        let githubAuth = await db.gitHubAuth.findUnique({
          where: { userId: user.id },
        });

        // If not, try to fetch from GitHub and upsert
        if (!githubAuth) {
          // Find the GitHub account for this user
          const account = await db.account.findFirst({
            where: {
              userId: user.id,
              provider: "github",
            },
          });

          if (account && account.access_token) {
            try {
              // Fetch profile from GitHub API
              const { data: githubProfile } = await axios.get<GitHubProfile>(
                "https://api.github.com/user",
                {
                  headers: {
                    Authorization: `token ${account.access_token}`,
                  },
                }
              );

              githubAuth = await db.gitHubAuth.upsert({
                where: { userId: user.id },
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
                  scopes: account.scope ? account.scope.split(",") : [],
                },
                create: {
                  userId: user.id,
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
                  scopes: account.scope ? account.scope.split(",") : [],
                },
              });
            } catch (err) {
              // If GitHub API fails, just skip
            }
          }
        }

        if (githubAuth) {
          (session.user as any).github = {
            username: githubAuth.githubUsername,
            publicRepos: githubAuth.publicRepos,
            followers: githubAuth.followers,
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