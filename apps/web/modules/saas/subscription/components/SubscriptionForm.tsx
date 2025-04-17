"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@shared/hooks/router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";

import { Textarea } from "@ui/components/textarea"
import { Checkbox } from "@ui/components/checkbox"
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  company: z.string().min(1),
  description: z.string().optional(),
  frequency: z.number().min(1),
  value: z.number().min(0),
  currency: z.string().length(3),
  cycle: z.enum(["Daily", "Weekly", "Monthly", "Yearly"]),
  type: z.string().max(30),
  recurring: z.boolean(),
  nextPaymentDate: z.string().datetime().optional(),
  contractExpiry: z.string().datetime().optional(),
  urlLink: z.string().url(),
  paymentMethod: z.string().max(30),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
  notesIncluded: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

export function SubscriptionForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      description: "",
      frequency: 1,
      value: 0,
      currency: "CNY",
      cycle: "Monthly",
      type: "Subscription",
      recurring: true,
      urlLink: "",
      paymentMethod: "",
      notes: "",
      notesIncluded: false
    }
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const subscription = await response.json();

      queryClient.invalidateQueries({
        queryKey: ["subscriptions"],
      });

      toast.success(t("common.status.success"));
      router.refresh();
      
      if (onSuccess) {
        onSuccess(); // 调用成功回调
      }
    } catch (e) {
      toast.error(t("common.status.error"));
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>公司/服务名称</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>金额</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>货币</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cycle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>周期</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">每日</SelectItem>
                    <SelectItem value="Weekly">每周</SelectItem>
                    <SelectItem value="Monthly">每月</SelectItem>
                    <SelectItem value="Yearly">每年</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="urlLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>链接</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>频率</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>类型</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recurring"
          render={({ field }) => (
            <FormItem>
              <FormLabel>是否循环</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">是</SelectItem>
                    <SelectItem value="false">否</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notesIncluded"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>包含备注</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextPaymentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>下次付款日期</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contractExpiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>合同到期日</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>付款方式</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>分类ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>备注</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          loading={form.formState.isSubmitting}
          className="w-full"
        >
          {t("common.confirmation.confirm")}
        </Button>
      </form>
    </Form>
  );
}