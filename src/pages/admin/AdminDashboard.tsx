import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  CreditCard,
  Play,
  Clock,
  TrendingUp,
  Crown,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  totalRevenue: number;
  totalWatchTime: number;
  totalVideos: number;
  upcomingLiveSessions: number;
}

interface TrendingVideo {
  id: string;
  title: string;
  views_count: number;
  thumbnail_url: string | null;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active subscribers
      const { count: subscriberCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('total_amount')
        .eq('status', 'completed');
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.total_amount || 0), 0) || 0;

      // Fetch total watch time
      const { data: watchData } = await supabase
        .from('videos')
        .select('total_watch_time_seconds');
      const totalWatchTime = watchData?.reduce((sum, v) => sum + (v.total_watch_time_seconds || 0), 0) || 0;

      // Fetch video count
      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      // Fetch upcoming sessions
      const { count: sessionCount } = await supabase
        .from('live_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_at', new Date().toISOString())
        .eq('is_completed', false);

      setStats({
        totalUsers: userCount || 0,
        activeSubscribers: subscriberCount || 0,
        totalRevenue,
        totalWatchTime,
        totalVideos: videoCount || 0,
        upcomingLiveSessions: sessionCount || 0,
      });

      // Fetch trending videos
      const { data: trending } = await supabase
        .from('videos')
        .select('id, title, views_count, thumbnail_url')
        .eq('is_published', true)
        .order('views_count', { ascending: false })
        .limit(5);
      setTrendingVideos(trending || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}K hrs`;
    }
    return `${hours} hrs`;
  };

  const formatRevenue = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Subscribers',
      value: stats?.activeSubscribers || 0,
      icon: Crown,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      title: 'Total Revenue',
      value: formatRevenue(stats?.totalRevenue || 0),
      icon: CreditCard,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Watch Time',
      value: formatWatchTime(stats?.totalWatchTime || 0),
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Videos',
      value: stats?.totalVideos || 0,
      icon: Play,
      color: 'text-terracotta',
      bgColor: 'bg-terracotta/10',
    },
    {
      title: 'Upcoming Live Sessions',
      value: stats?.upcomingLiveSessions || 0,
      icon: Calendar,
      color: 'text-sage-dark',
      bgColor: 'bg-sage/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="stat-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold font-display">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Trending Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Trending Videos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-10 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                ))}
              </div>
            ) : trendingVideos.length > 0 ? (
              <div className="space-y-4">
                {trendingVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div className="w-20 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.title}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {video.views_count?.toLocaleString() || 0} views
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No videos yet. Start by adding some content!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
