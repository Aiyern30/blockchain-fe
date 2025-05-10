/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import {
  Input,
  Textarea,
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import emailjs from "emailjs-com";
import { cn } from "@/lib/utils";
import {
  Twitter,
  Instagram,
  MessageSquare,
  Send,
  Phone,
  Mail,
  User,
  Globe,
  Loader2,
  HelpCircle,
  Wallet,
  ShoppingBag,
  Shield,
} from "lucide-react";

// Schema definition
const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  contactNumber: z.string().optional(),
  inquiryType: z.string({
    required_error: "Please select an inquiry type.",
  }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

// Social links data
const socialLinks = [
  {
    name: "Twitter",
    url: "https://twitter.com/nftmarketplace",
    icon: <Twitter className="w-5 h-5" />,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/nftmarketplace/",
    icon: <Instagram className="w-5 h-5" />,
  },
  {
    name: "Discord",
    url: "https://discord.gg/nftmarketplace",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    name: "Website",
    url: "https://nftmarketplace.com",
    icon: <Globe className="w-5 h-5" />,
  },
];

// Inquiry types
const inquiryTypes = [
  {
    value: "general",
    label: "General Inquiry",
    icon: <HelpCircle className="w-4 h-4 mr-2" />,
  },
  {
    value: "wallet",
    label: "Wallet Support",
    icon: <Wallet className="w-4 h-4 mr-2" />,
  },
  {
    value: "purchase",
    label: "Purchase Issues",
    icon: <ShoppingBag className="w-4 h-4 mr-2" />,
  },
  {
    value: "security",
    label: "Security Concerns",
    icon: <Shield className="w-4 h-4 mr-2" />,
  },
];

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      inquiryType: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = {
      firstname: data.firstName,
      lastname: data.lastName,
      email: data.email,
      contactNumber: data.contactNumber,
      inquiryType: data.inquiryType,
      enquiry: data.message,
    };

    emailjs
      .send(
        "service_kgb3j15",
        "template_2vj3nql",
        formData,
        "deYKZbFxD1zzhjpFe"
      )
      .then(() => {
        toast({
          title: "Message sent!",
          description:
            "Our support team will get back to you as soon as possible.",
        });
        form.reset();
        setFormSubmitted(true);
        setTimeout(() => setFormSubmitted(false), 5000);
      })
      .catch(() => {
        toast({
          title: "Failed to send message.",
          description: "Please try again later.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <section
      className="py-16 md:py-24 px-4 md:px-6 text-white relative"
      id="contact-us"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4">Contact Support</h2>
          <motion.div
            className="h-1 w-32 bg-gradient-to-r from-[#FF9D7A] to-[#FFD166] mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "8rem" }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Have questions about our NFT marketplace or need assistance? Our
            team is here to help!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-xl border border-white/10 shadow-xl"
          >
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="w-16 h-16 bg-[#FF9D7A]/20 rounded-full flex items-center justify-center mb-6">
                  <Send className="w-8 h-8 text-[#FF9D7A]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-white/70 mb-6">
                  Thank you for reaching out. Our support team will get back to
                  you as soon as possible.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFormSubmitted(false)}
                  className="border-white/20"
                >
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80">
                              First name
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                                <Input
                                  placeholder="John"
                                  className=" pl-10 text-white"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80">
                              Last name
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                                <Input
                                  placeholder="Doe"
                                  className=" pl-10 text-white"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                              <Input
                                type="email"
                                placeholder="johndoe@example.com"
                                className=" pl-10 text-white"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">
                            Contact number (optional)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                              <Input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className=" pl-10 text-white"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-white/50 text-xs">
                            We'll only use this to contact you if necessary.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="inquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">
                            Inquiry Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className=" text-white">
                                <SelectValue placeholder="Select inquiry type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inquiryTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center">
                                    {type.icon}
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">
                            Message
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MessageSquare className="absolute left-3 top-3 text-white/40 w-4 h-4" />
                              <Textarea
                                placeholder="Please describe your issue or question in detail..."
                                className="resize-none pl-10 text-white min-h-[120px]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className={cn(
                        "w-full text-white bg-gradient-to-r from-[#FF9D7A] to-[#FFD166] hover:opacity-90 transition-all"
                      )}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white p-8 rounded-xl border border-white/10 shadow-xl flex flex-col justify-between"
          >
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Discover, Collect, and Sell{" "}
                <span className="text-[#FF9D7A]">Extraordinary</span> NFTs
                <br />
                Join our <span className="text-[#FFD166]">thriving</span>{" "}
                community.
              </h3>

              <p className="text-white/70 mb-8">
                Our NFT marketplace connects artists and collectors in a secure,
                user-friendly environment. Whether you're looking to buy your
                first NFT, need help with a transaction, or have questions about
                creating and selling your own digital assets, our support team
                is here to assist you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                  <div className="mt-1">
                    <ShoppingBag className="w-5 h-5 text-[#FF9D7A]" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Marketplace Support</h4>
                    <p className="text-sm text-white/70">
                      Get help with buying, selling, and trading NFTs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                  <div className="mt-1">
                    <Wallet className="w-5 h-5 text-[#FFD166]" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Wallet Assistance</h4>
                    <p className="text-sm text-white/70">
                      Resolve issues with connecting wallets and transactions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                  <div className="mt-1">
                    <Shield className="w-5 h-5 text-[#FF9D7A]" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Security Concerns</h4>
                    <p className="text-sm text-white/70">
                      Get help with account security and suspicious activity
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                  <div className="mt-1">
                    <HelpCircle className="w-5 h-5 text-[#FFD166]" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">General Inquiries</h4>
                    <p className="text-sm text-white/70">
                      Questions about our platform, fees, or services
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4 border-b border-white/10 pb-2">
                Connect With Us
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-full">{link.icon}</div>
                    <span className="font-medium">{link.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
