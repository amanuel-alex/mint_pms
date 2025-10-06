import { footerPages } from "@/lib/footerPages";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    Info,
    Shield,
    DollarSign,
    BookOpen,
    Briefcase,
    HelpCircle,
    Phone,
    Activity,
    Lock,
    FileText,
    Cookie,
    ChevronLeft
} from "lucide-react";

type PageProps = {
    params: { slug: string };
};

export function generateStaticParams() {
    return Object.keys(footerPages).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps) {
    const page = footerPages[params.slug];
    if (!page) return {};
    return {
        title: page.title,
        description: page.content.slice(0, 160)
    };
}

export default function InfoPage({ params }: PageProps) {
    const page = footerPages[params.slug];
    if (!page) notFound();

    const iconMap: Record<string, any> = {
        features: Info,
        pricing: DollarSign,
        security: Shield,
        about: BookOpen,
        blog: BookOpen,
        careers: Briefcase,
        help: HelpCircle,
        contact: Phone,
        status: Activity,
        privacy: Lock,
        terms: FileText,
        cookies: Cookie
    };

    const Icon = iconMap[params.slug] ?? Info;
    const navItems = Object.entries(footerPages).map(([slug, meta]) => ({ slug, title: meta.title }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="border-b bg-gradient-to-r from-[#087684]/10 to-[#065a66]/10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <Link href="/" className="inline-flex items-center text-[#087684] hover:text-[#065a66] font-medium">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to home
                    </Link>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow flex items-center justify-center border border-[#087684]/20">
                            <Icon className="h-6 w-6 text-[#087684]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
                            <p className="text-gray-600 mt-1">Learn more about our platform and policies</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-12 gap-8">
                <aside className="md:col-span-4 lg:col-span-3 hidden md:block">
                    <div className="sticky top-6 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.slug}
                                href={`/info/${item.slug}`}
                                className={`block px-4 py-3 rounded-xl border transition-all ${
                                    item.slug === params.slug
                                        ? "bg-white border-[#087684]/30 text-[#087684] shadow"
                                        : "bg-white/70 hover:bg-white border-gray-200 text-gray-700 hover:shadow"
                                }`}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </aside>

                <main className="md:col-span-8 lg:col-span-9">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
                        <div className="flex items-start gap-4 mb-4 md:mb-6">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#087684]/10 to-[#065a66]/10 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-[#087684]" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{page.title}</h2>
                        </div>
                        <div className="text-gray-700 leading-7 whitespace-pre-line">
                            {page.content}
                        </div>
                    </div>

                    <div className="mt-8 grid sm:grid-cols-2 gap-4">
                        <Link href="/info/help" className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="h-5 w-5 text-[#087684]" />
                                    <span className="font-medium text-gray-900">Need help?</span>
                                </div>
                                <span className="text-[#087684] group-hover:translate-x-0.5 transition-transform">→</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Visit our Help Center</p>
                        </Link>
                        <Link href="/info/contact" className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-[#087684]" />
                                    <span className="font-medium text-gray-900">Contact us</span>
                                </div>
                                <span className="text-[#087684] group-hover:translate-x-0.5 transition-transform">→</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">We'd love to hear from you</p>
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}


