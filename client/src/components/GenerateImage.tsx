import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Sparkles, Image as ImageIcon, RefreshCw, Share2, Download } from 'lucide-react';

const STYLES = [
    { id: 'realistic', label: 'Realistic', image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&q=80' },
    { id: 'anime', label: 'Anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80' },
    { id: 'digital-art', label: 'Digital Art', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80' },
    { id: 'oil-painting', label: 'Oil Painting', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80' },
    { id: 'cyberpunk', label: 'Cyberpunk', image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe33?w=400&q=80' },
    { id: '3d-render', label: '3D Render', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80' },
];

const GenerateImage = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('realistic');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const generateMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/ai/generate', {
                prompt,
                style: selectedStyle,
            });
            return response.data;
        },
        onSuccess: (data) => {
            setGeneratedImage(data.imageUrl);
            setGenerating(false);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to generate image');
            setGenerating(false);
        },
    });

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setError('');
        setGenerating(true);
        generateMutation.mutate();
    };

    const handlePostToFeed = async () => {
        if (!generatedImage) return;

        try {
            setGenerating(true); // Reuse loading state
            const response = await api.post('/feed', {
                mediaType: 'image',
                mediaUrl: generatedImage,
                caption: `AI Art: ${prompt} #${selectedStyle}`,
                tags: ['ai-art', selectedStyle, 'generated'],
                category: 'Art',
            });
            console.log('Post created:', response.data);
            navigate('/feed');
        } catch (err) {
            console.error('Failed to post', err);
            setError('Failed to post to feed');
            setGenerating(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-deep-purple to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-deep-purple/30">
                    <Sparkles className="text-white" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">AI Art Studio</h2>
                <p className="text-accent-beige/60">Transform your imagination into reality</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column: Controls */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-accent-beige/90 mb-2 text-sm font-bold uppercase tracking-wider">
                            Describe your vision
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-2xl text-accent-beige placeholder:text-accent-beige/20 focus:outline-none focus:border-deep-purple focus:ring-1 focus:ring-deep-purple/50 transition-all resize-none"
                            placeholder="A futuristic city with flying cars at sunset..."
                            maxLength={500}
                        />
                    </div>

                    <div>
                        <label className="block text-accent-beige/90 mb-3 text-sm font-bold uppercase tracking-wider">
                            Choose a Style
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all ${selectedStyle === style.id
                                        ? 'border-deep-purple scale-105 shadow-lg shadow-deep-purple/20'
                                        : 'border-transparent hover:border-white/20'
                                        }`}
                                >
                                    <img
                                        src={style.image}
                                        alt={style.label}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${selectedStyle === style.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`}>
                                        <span className="text-white text-xs font-bold">{style.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating || !prompt.trim()}
                        className="w-full py-4 bg-gradient-to-r from-deep-purple to-pink-600 hover:brightness-110 text-white rounded-2xl font-bold text-lg shadow-lg shadow-deep-purple/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {generating ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                <span className="animate-pulse">Dreaming up your art...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Art
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-2xl text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Column: Preview */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                    {generatedImage ? (
                        <>
                            <img
                                src={generatedImage}
                                alt="Generated Art"
                                className="w-full h-full object-contain rounded-xl shadow-2xl"
                            />
                            <div className="absolute bottom-6 flex gap-3">
                                <button
                                    onClick={handlePostToFeed}
                                    className="px-6 py-3 bg-deep-purple text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <Share2 size={18} />
                                    Post to Feed
                                </button>
                                <a
                                    href={generatedImage}
                                    download={`ai-art-${Date.now()}.png`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold backdrop-blur-md transition-all flex items-center gap-2"
                                >
                                    <Download size={18} />
                                    Download
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="text-center opacity-40">
                            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <ImageIcon size={48} />
                            </div>
                            <p className="text-xl font-bold">Your art will appear here</p>
                            <p className="text-sm mt-2">Select a style and enter a prompt to begin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateImage;
