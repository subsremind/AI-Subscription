"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@shared/hooks/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {cn} from "@ui/lib";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ui/components/popover";
import { format } from "date-fns"
import { Calendar } from "@ui/components/calendar";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@ui/components/textarea"
import { Checkbox } from "@ui/components/checkbox"
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const CURRENCIES = [
  "USD", "GBP", "EUR", "AUD", "NZD", "AED", "AFN", "ALL", "AMD", "ANG", 
  "AOA", "ARS", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF",
  "BMD", "BND", "BOB", "BRL", "BSD", "BTC", "BTN", "BTS", "BWP", "BYN",
  "BZD", "CAD", "CDF", "CHF", "CLF", "CLP", "CNH", "CNY", "COP", "CRC",
  "CUC", "CUP", "CVE", "CZK", "DASH", "DJF", "DKK", "DOGE", "DOP", "DZD",
  "EAC", "EGP", "EMC", "ERN", "ETB", "ETH", "FCT", "FJD"
] as const;

const CYCLES = ["Daily", "Weekly", "Monthly", "Yearly"] as const;
const TYPES = ["Subscription", "Trial", "Lifetime", "Revenue"] as const;
const PAYMENT_METHODS = ["PayPal", "Credit Card", "Free"] as const;

const formSchema = z.object({
  company: z.string().min(1),
  description: z.string().optional(),
  frequency: z.number().min(1, "Frequency must be at least 1"),
  value: z.number().min(0, "Amount cannot be less than 0").refine(val => !isNaN(val), {
    message: "Amount must be a number"
  }),
  currency: z.enum(CURRENCIES),
  cycle: z.enum(CYCLES),
  type: z.enum(TYPES),
  recurring: z.boolean(),
  nextPaymentDate: z.string().datetime().optional(),
  contractExpiry: z.string().datetime().optional(),
  urlLink: z.string().optional(),
  paymentMethod: z.string().nullable().default(null),
  categoryId: z.string().nullable().default(null),
  notes: z.string().optional(),
  notesIncluded: z.boolean(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SubscriptionForm({ subscription, onSuccess, categoryId, organizationId }: { 
  subscription?: any;
  onSuccess: () => void;
  categoryId?: string;
  organizationId?: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

        
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['subscription-categories-select', organizationId],
    queryFn: async () => {
      const url = organizationId ? `/api/subscription-categories/select?organizationId=${organizationId}` : '/api/subscription-categories/select';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
      }
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: subscription ? {
      ...subscription,
      value: subscription.value ? Number(subscription.value) : 0,
      frequency: subscription.frequency ? Number(subscription.frequency) : 1,
      nextPaymentDate: subscription.nextPaymentDate ? new Date(subscription.nextPaymentDate).toISOString() : undefined,
      contractExpiry: subscription.contractExpiry ? new Date(subscription.contractExpiry).toISOString() : undefined
    } : {
      company: '',
      description: '',
      frequency: 1,
      value: 0,
      currency: 'USD',
      cycle: 'Monthly',
      type: 'Subscription',
      recurring: true,
      nextPaymentDate: undefined,
      contractExpiry: undefined,
      urlLink: '',
      paymentMethod: '',
      categoryId: categoryId || '',
      notes: '',
      notesIncluded: false,
      tags: []
    }
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const url = subscription ? `/api/subscription/${subscription.id}` : '/api/subscription';
      const method = subscription ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          organizationId
        }),
      });

      if (!response.ok) {
        throw new Error(subscription ? "Failed to update subscription" : "Failed to create subscription");
      }

      queryClient.invalidateQueries({ queryKey: ['subscription-categories'] });
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });

      toast.success(t("common.status.success"));
      router.refresh();
      onSuccess();
    } catch (e) {
      toast.error(t("common.status.error"));
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
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
              <FormLabel>Description</FormLabel>
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
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min={0}
                  step="0.01"  // Add this line to support two decimal places
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
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>Billing Cycle</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLES.map(cycle => (
                      <SelectItem key={cycle} value={cycle}>
                        {cycle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>Frequency</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min={1}
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
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>Recurring</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextPaymentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Next Payment Date</FormLabel>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
											variant={"outline"}
											className={cn(
													"w-full pl-3 text-left font-normal bg-transparent !text-foreground border border-input cursor-pointer", // Added cursor-pointer
													!field.value && "text-muted-foreground"
												)}
											>
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 " align="start" >
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date.toISOString());
                      }
                    }}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="[&_.text-secondary]:text-foreground"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        

        <FormField
          control={form.control}
          name="contractExpiry"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Contract Expiry</FormLabel>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal bg-transparent !text-foreground border border-input cursor-pointer", // Added cursor-pointer
                        !field.value && "text-muted-foreground"
                      )}
                      onClick={() => console.log('PopoverTrigger clicked')}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" >
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date.toISOString());
                      }
                    }}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="[&_.text-secondary]:text-foreground"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={(value) => field.onChange(value === '' ? null : value)}
                  value={field.value || ''}
                  defaultValue={field.value || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>
                      None
                    </SelectItem>
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
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
              <FormLabel>URL</FormLabel>
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
        <FormLabel>Category</FormLabel>
        <FormControl>
        <Select 
          onValueChange={field.onChange} 
          value={field.value}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>
              None
            </SelectItem>
            {categories.map((category: { id: string, name: string }) => (
            <SelectItem key={category.id} value={category.id}>
            {category.name}
            </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </FormControl>
        <FormMessage />
        </FormItem>
        )}
        />

        


        
        

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Notes</FormLabel>
                <FormField
                  control={form.control}
                  name="notesIncluded"
                  render={({ field: notesIncludedField }) => (
                    <div className="flex items-center space-x-2">
                      <FormLabel className="text-sm font-normal">Include in alerts</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={notesIncludedField.value}
                          onCheckedChange={notesIncludedField.onChange}
                        />
                      </FormControl>
                    </div>
                  )}
                />
              </div>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        

        <div className="col-span-2">
          <Button 
            type="submit" 
            loading={form.formState.isSubmitting}
            className="w-full"
          >
            {t("common.confirmation.confirm")}
          </Button>
        </div>
      </form>
    </Form>
  );
}