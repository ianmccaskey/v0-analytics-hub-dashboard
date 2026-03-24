"use client"

import { useEffect, useState } from "react"
import { Loader } from "./loader"
import { ExternalLink } from "lucide-react"

interface SocialPost {
  id: string
  title: string
  url: string
  sessions: number
  users: number
  conversions: number
  ctr?: number
}

interface SocialMetrics {
  totalSessions: number
  totalUsers: number
  totalConversions: number
}

interface SocialMediaEngagementProps {
  dateRange: { startDate: string; endDate: string }
}

export function SocialMediaEngagement({ dateRange }: SocialMediaEngagementProps) {
  const [loading, setLoading] = useState(true)
  const [linkedinPosts, setLinkedinPosts] = useState<SocialPost[]>([])
  const [xPosts, setXPosts] = useState<SocialPost[]>([])
  const [linkedinMetrics, setLinkedinMetrics] = useState<SocialMetrics>({
    totalSessions: 0,
    totalUsers: 0,
    totalConversions: 0,
  })
  const [xMetrics, setXMetrics] = useState<SocialMetrics>({
    totalSessions: 0,
    totalUsers: 0,
    totalConversions: 0,
  })

  useEffect(() => {
    // Simulating API fetch with mock data
    const fetchData = async () => {
      setLoading(true)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock LinkedIn posts
      const mockLinkedinPosts: SocialPost[] = [
        {
          id: "li-1",
          title: "5 Ways to Improve Your Analytics Strategy",
          url: "https://linkedin.com/posts/company-post-1",
          sessions: 342,
          users: 298,
          conversions: 12,
          ctr: 4.2,
        },
        {
          id: "li-2",
          title: "New Feature Launch: Real-Time Dashboard",
          url: "https://linkedin.com/posts/company-post-2",
          sessions: 567,
          users: 489,
          conversions: 24,
          ctr: 5.8,
        },
        {
          id: "li-3",
          title: "Customer Success Story: How We Increased ROI by 300%",
          url: "https://linkedin.com/posts/company-post-3",
          sessions: 892,
          users: 756,
          conversions: 45,
          ctr: 7.1,
        },
        {
          id: "li-4",
          title: "Industry Report: Analytics Trends for 2025",
          url: "https://linkedin.com/posts/company-post-4",
          sessions: 234,
          users: 201,
          conversions: 8,
          ctr: 3.5,
        },
        {
          id: "li-5",
          title: "Webinar Recap: Mastering GA4",
          url: "https://linkedin.com/posts/company-post-5",
          sessions: 445,
          users: 387,
          conversions: 18,
          ctr: 4.9,
        },
      ]

      // Mock X posts
      const mockXPosts: SocialPost[] = [
        {
          id: "x-1",
          title: "Just launched our new analytics dashboard!",
          url: "https://x.com/company/status/1234567890",
          sessions: 156,
          users: 134,
          conversions: 5,
          ctr: 3.2,
        },
        {
          id: "x-2",
          title: "Quick tip: Use UTM parameters for better tracking",
          url: "https://x.com/company/status/1234567891",
          sessions: 289,
          users: 245,
          conversions: 11,
          ctr: 4.1,
        },
        {
          id: "x-3",
          title: "Behind the scenes: Building our analytics platform",
          url: "https://x.com/company/status/1234567892",
          sessions: 423,
          users: 367,
          conversions: 19,
          ctr: 5.4,
        },
        {
          id: "x-4",
          title: "Join our live Q&A on data privacy tomorrow",
          url: "https://x.com/company/status/1234567893",
          sessions: 198,
          users: 172,
          conversions: 7,
          ctr: 3.8,
        },
        {
          id: "x-5",
          title: "New blog post: The Future of Social Media Analytics",
          url: "https://x.com/company/status/1234567894",
          sessions: 334,
          users: 289,
          conversions: 15,
          ctr: 4.7,
        },
      ]

      // Calculate metrics
      const liMetrics = {
        totalSessions: mockLinkedinPosts.reduce((sum, post) => sum + post.sessions, 0),
        totalUsers: mockLinkedinPosts.reduce((sum, post) => sum + post.users, 0),
        totalConversions: mockLinkedinPosts.reduce((sum, post) => sum + post.conversions, 0),
      }

      const xMetrics = {
        totalSessions: mockXPosts.reduce((sum, post) => sum + post.sessions, 0),
        totalUsers: mockXPosts.reduce((sum, post) => sum + post.users, 0),
        totalConversions: mockXPosts.reduce((sum, post) => sum + post.conversions, 0),
      }

      setLinkedinPosts(mockLinkedinPosts)
      setXPosts(mockXPosts)
      setLinkedinMetrics(liMetrics)
      setXMetrics(xMetrics)
      setLoading(false)
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-[26px] font-semibold text-foreground">Social Media Engagement</h2>
        <p className="text-[15px] text-muted-foreground">Track website traffic driven by social media posts.</p>
      </div>

      {/* LinkedIn Card */}
      <div className="rounded-[18px] border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10">
            <svg className="h-5 w-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </div>
          <h3 className="text-[20px] font-semibold text-foreground">LinkedIn</h3>
        </div>

        {/* LinkedIn Metrics */}
        <div className="mb-8 grid grid-cols-3 gap-6">
          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <p className="mb-2 text-[13px] font-medium tracking-wide text-muted-foreground">Total Sessions</p>
            <p className="text-[24px] font-semibold text-[#18F2C4] drop-shadow-[0_0_12px_rgba(24,242,196,0.3)]">
              {linkedinMetrics.totalSessions.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <p className="mb-2 text-[13px] font-medium tracking-wide text-muted-foreground">Total Users</p>
            <p className="text-[24px] font-semibold text-[#3DA5FF] drop-shadow-[0_0_12px_rgba(61,165,255,0.3)]">
              {linkedinMetrics.totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <p className="mb-2 text-[13px] font-medium tracking-wide text-muted-foreground">Total Conversions</p>
            <p className="text-[24px] font-semibold text-[#18F2C4] drop-shadow-[0_0_12px_rgba(24,242,196,0.3)]">
              {linkedinMetrics.totalConversions.toLocaleString()}
            </p>
          </div>
        </div>

        {/* LinkedIn Posts Table */}
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Post Title
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Post URL
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Sessions
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Users
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Conversions
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  CTR %
                </th>
              </tr>
            </thead>
            <tbody>
              {linkedinPosts.map((post) => (
                <tr
                  key={post.id}
                  className="group cursor-pointer border-b border-border transition-colors hover:bg-[#18F2C4]/5"
                >
                  <td className="px-6 py-4 text-[15px] font-medium text-foreground">{post.title}</td>
                  <td className="px-6 py-4">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[14px] text-primary transition-colors hover:text-primary/80"
                    >
                      View Post
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">
                    {post.sessions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">{post.users.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">
                    {post.conversions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">
                    {post.ctr ? `${post.ctr}%` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* X (Twitter) Card */}
      <div className="rounded-[18px] border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/10">
            <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <h3 className="text-[20px] font-semibold text-foreground">X (Twitter)</h3>
        </div>

        {/* X Metrics */}
        <div className="mb-8 grid grid-cols-3 gap-6">
          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <p className="mb-2 text-[13px] font-medium tracking-wide text-muted-foreground">Total Sessions</p>
            <p className="text-[24px] font-semibold text-[#18F2C4] drop-shadow-[0_0_12px_rgba(24,242,196,0.3)]">
              {xMetrics.totalSessions.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <p className="mb-2 text-[13px] font-medium tracking-wide text-muted-foreground">Total Users</p>
            <p className="text-[24px] font-semibold text-[#3DA5FF] drop-shadow-[0_0_12px_rgba(61,165,255,0.3)]">
              {xMetrics.totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <p className="mb-2 text-[13px] font-medium tracking-wide text-muted-foreground">Total Conversions</p>
            <p className="text-[24px] font-semibold text-[#18F2C4] drop-shadow-[0_0_12px_rgba(24,242,196,0.3)]">
              {xMetrics.totalConversions.toLocaleString()}
            </p>
          </div>
        </div>

        {/* X Posts Table */}
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Post Title
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Post URL
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Sessions
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Users
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  Conversions
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                  CTR %
                </th>
              </tr>
            </thead>
            <tbody>
              {xPosts.map((post) => (
                <tr
                  key={post.id}
                  className="group cursor-pointer border-b border-border transition-colors hover:bg-[#18F2C4]/5"
                >
                  <td className="px-6 py-4 text-[15px] font-medium text-foreground">{post.title}</td>
                  <td className="px-6 py-4">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[14px] text-primary transition-colors hover:text-primary/80"
                    >
                      View Post
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">
                    {post.sessions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">{post.users.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">
                    {post.conversions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">
                    {post.ctr ? `${post.ctr}%` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
