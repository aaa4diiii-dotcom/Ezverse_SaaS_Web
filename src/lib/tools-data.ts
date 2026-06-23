import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type ToolCategory = "Writing" | "Image" | "Code" | "Audio" | "Video" | "Data";

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  credits: number;
  popular?: boolean;
  inputLabel: string;
  inputPlaceholder: string;
  sampleOutput: string;
};

export const CATEGORIES: ToolCategory[] = ["Writing", "Image", "Code", "Audio", "Video", "Data"];

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*").order("name");
      if (error) throw error;
      return data.map((t) => ({
        slug: t.slug,
        name: t.name,
        tagline: t.tagline,
        description: t.description,
        category: t.category as ToolCategory,
        credits: t.credits,
        popular: t.popular ?? false,
        inputLabel: t.input_label,
        inputPlaceholder: t.input_placeholder,
        sampleOutput: t.sample_output,
      })) as Tool[];
    },
  });
}

export function useTool(slug: string) {
  return useQuery({
    queryKey: ["tool", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        slug: data.slug,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        category: data.category as ToolCategory,
        credits: data.credits,
        popular: data.popular ?? false,
        inputLabel: data.input_label,
        inputPlaceholder: data.input_placeholder,
        sampleOutput: data.sample_output,
      } as Tool;
    },
  });
}
