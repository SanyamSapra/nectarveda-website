'use client';

import Link from "next/link";
import {
    Leaf,
    ShieldCheck,
    Heart,
    Sparkles,
    ArrowRight,
    CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";
import { buttonMotion, cardHover, fadeUp, staggerContainer, staggerItem } from "@/lib/animations";

export default function AboutPage() {
    const features = [
        {
            icon: Leaf,
            title: "Authentic Ayurveda",
            description:
                "Traditional Ayurvedic formulations inspired by centuries of natural healing wisdom.",
        },
        {
            icon: Sparkles,
            title: "Premium Ingredients",
            description:
                "Carefully selected herbs and natural ingredients sourced with quality in mind.",
        },
        {
            icon: ShieldCheck,
            title: "Quality Assurance",
            description:
                "Every product is prepared and checked to maintain purity and consistency.",
        },
        {
            icon: Heart,
            title: "Customer First",
            description:
                "Our focus is helping customers build healthier lifestyles through natural wellness.",
        },
    ];

    const values = [
        "Purity",
        "Transparency",
        "Wellness First",
        "Sustainability",
    ];

    const process = [
        "Ingredient Selection",
        "Research & Formulation",
        "Quality Testing",
        "Safe Packaging",
        "Delivered To You",
    ];

    return (
        <motion.main className="min-h-screen bg-slate-50" {...fadeUp}>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <motion.div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center" {...fadeUp}>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-6">
                        <Leaf size={16} />
                        Trusted Ayurvedic Wellness
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
                        Rooted in Ayurveda.
                        <br />
                        Crafted with Care.
                    </h1>

                    <p className="max-w-2xl mx-auto mt-6 text-lg text-slate-600 leading-relaxed">
                        NectarVeda combines traditional Ayurvedic wisdom with
                        carefully crafted herbal products to support natural
                        wellness and healthier living.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                        <motion.div {...buttonMotion}>
                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-xl font-semibold transition-all"
                            >
                                Explore Products
                                <ArrowRight size={18} />
                            </Link>
                        </motion.div>

                        <motion.div {...buttonMotion}>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700 transition-all"
                            >
                                Contact Us
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Story Section */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">

                        <div className="bg-gradient-to-br from-teal-100 to-emerald-50 rounded-3xl h-96 flex items-center justify-center">
                            <Leaf className="text-teal-700" size={80} />
                        </div>

                        <div>
                            <span className="text-teal-700 font-semibold">
                                Our Story
                            </span>

                            <h2 className="text-3xl font-bold text-slate-900 mt-3">
                                Bringing Ayurveda Closer to Everyday Life
                            </h2>

                            <p className="mt-5 text-slate-600 leading-relaxed">
                                NectarVeda was founded with a simple mission —
                                making authentic Ayurvedic solutions accessible
                                to everyone. Inspired by traditional healing
                                practices and natural wellness principles, we
                                focus on creating products that support overall
                                health and well-being.
                            </p>

                            <p className="mt-4 text-slate-600 leading-relaxed">
                                Every product is crafted with care, using
                                thoughtfully selected ingredients while
                                maintaining our commitment to quality, purity,
                                and customer trust.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">

                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-900">
                            What Makes NectarVeda Different
                        </h2>

                        <p className="text-slate-600 mt-3">
                            Built on trust, quality, and Ayurvedic traditions.
                        </p>
                    </div>

                    <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
                        {features.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <motion.div
                                    key={index}
                                    className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
                                    variants={staggerItem}
                                    whileHover={cardHover}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                                        <Icon
                                            size={22}
                                            className="text-teal-700"
                                        />
                                    </div>

                                    <h3 className="font-semibold text-slate-900 mb-2">
                                        {feature.title}
                                    </h3>

                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                </div>
            </section>

            {/* Values */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">

                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Our Core Values
                        </h2>
                    </div>

                    <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
                        {values.map((value) => (
                            <motion.div
                                key={value}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center"
                                variants={staggerItem}
                                whileHover={cardHover}
                            >
                                <CheckCircle2
                                    className="mx-auto text-teal-700 mb-3"
                                    size={28}
                                />

                                <h3 className="font-semibold text-slate-900">
                                    {value}
                                </h3>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </section>

            {/* Process */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">

                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Our Process
                        </h2>
                    </div>

                    <motion.div className="grid md:grid-cols-5 gap-6" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
                        {process.map((step, index) => (
                            <motion.div
                                key={step}
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center"
                                variants={staggerItem}
                                whileHover={cardHover}
                            >
                                <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center mx-auto mb-4 font-semibold">
                                    {index + 1}
                                </div>

                                <p className="font-medium text-slate-900">
                                    {step}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </section>

            {/* Stats */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                            <h3 className="text-3xl font-bold text-teal-700">
                                500+
                            </h3>
                            <p className="text-slate-600 mt-2">
                                Happy Customers
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                            <h3 className="text-3xl font-bold text-teal-700">
                                20+
                            </h3>
                            <p className="text-slate-600 mt-2">
                                Ayurvedic Products
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                            <h3 className="text-3xl font-bold text-teal-700">
                                100%
                            </h3>
                            <p className="text-slate-600 mt-2">
                                Natural Ingredients
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                            <h3 className="text-3xl font-bold text-teal-700">
                                24/7
                            </h3>
                            <p className="text-slate-600 mt-2">
                                Customer Support
                            </p>
                        </div>

                    </div>

                </div>
            </section>

            {/* CTA */}
            <section className="pb-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">

                    <div className="bg-gradient-to-r from-teal-700 to-emerald-600 rounded-3xl p-10 md:p-14 text-center text-white">

                        <h2 className="text-3xl md:text-4xl font-bold">
                            Start Your Wellness Journey Today
                        </h2>

                        <p className="mt-4 text-teal-50 max-w-2xl mx-auto">
                            Discover Ayurvedic products crafted with care,
                            tradition, and a commitment to your well-being.
                        </p>

                        <motion.div {...buttonMotion}>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 mt-8 bg-white text-teal-700 hover:bg-slate-100 px-8 py-4 rounded-xl font-semibold transition-all"
                            >
                                Browse Products
                                <ArrowRight size={18} />
                            </Link>
                        </motion.div>

                    </div>

                </div>
            </section>

        </motion.main>
    );
}
