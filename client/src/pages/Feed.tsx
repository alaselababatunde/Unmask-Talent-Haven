import { useState, useRef } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

type Post = {
  id: string;
  videoUrl: string;
  likes: number;
  isLiked: boolean;
  username: string;
};

const mockPosts: Post[] = [
  {
    id: "1",
    videoUrl: "/videos/sample.mp4",
    likes: 120,
    isLiked: false,
    username: "john_doe",
  },
];

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  /* ---------------- LIKE HANDLER ---------------- */
  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  /* ---------------- FOLLOW MUTATION ---------------- */
  const followMutation = useMutation({
    mutationFn: async (username: string) => {
      // replace with real API later
      return username;
    },
  });

  /* ---------------- VIDEO TOGGLE ---------------- */
  const toggleVideo = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div className="w-full h-screen overflow-y-scroll bg-black">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative w-full h-screen flex items-center justify-center"
        >
          {/* VIDEO */}
          <video
            ref={(el) => (videoRefs.current[post.id] = el)}
            src={post.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onClick={() => toggleVideo(post.id)}
          />

          {/* RIGHT CONTROLS */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 text-white">
            <button onClick={() => handleLike(post.id)}>
              <Heart
                size={32}
                className={post.isLiked ? "fill-red-500 text-red-500" : ""}
              />
              <p className="text-sm text-center">{post.likes}</p>
            </button>

            <button>
              <MessageCircle size={32} />
            </button>

            <button>
              <Share2 size={32} />
            </button>
          </div>

          {/* USER INFO */}
          <div className="absolute left-4 bottom-16 text-white">
            <p className="font-semibold">@{post.username}</p>
            <button
              className="mt-2 text-sm border px-3 py-1 rounded"
              onClick={() => followMutation.mutate(post.username)}
            >
              Follow
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
