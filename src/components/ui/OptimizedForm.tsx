import React, { useMemo } from 'react';
import { 
  useForm, 
  FormProvider, 
  UseFormReturn, 
  FieldValues,
  UseFormProps,
  SubmitHandler
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startPerformanceMarker, endPerformanceMarker } from '../../utils/performanceMonitor';
import { z } from 'zod';

interface OptimizedFormProps<TFormValues extends FieldValues> {
  /** Form ID for accessibility */
  id?: string;
  /** The schema to validate the form with */
  schema?: z.ZodType<any, any>;
  /** Default values for the form */
  defaultValues?: UseFormProps<TFormValues>['defaultValues'];
  /** Function called when form is submitted and validation passes */
  onSubmit: SubmitHandler<TFormValues>;
  /** Function called when form validation fails */
  onError?: (errors: any) => void;
  /** Additional form props */
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
  /** Additional props passed to useForm */
  formOptions?: Omit<UseFormProps<TFormValues>, 'defaultValues' | 'resolver'>;
  /** Children of the form */
  children: React.ReactNode | ((methods: UseFormReturn<TFormValues>) => React.ReactNode);
  /** Debounce validation for performance (milliseconds, 0 to disable) */
  debounceValidation?: number;
  /** Whether to show validation errors before submit */
  showErrorsOnChange?: boolean;
  /** Class names for the form */
  className?: string;
}

/**
 * Performance-optimized form component using react-hook-form
 * Provides form validation, submission handling, and performance monitoring
 */
export function OptimizedForm<TFormValues extends FieldValues>({
  id,
  schema,
  defaultValues,
  onSubmit,
  onError,
  formProps,
  formOptions,
  children,
  debounceValidation = 150,
  showErrorsOnChange = true,
  className = ''
}: OptimizedFormProps<TFormValues>) {
  // Create memoized form configuration
  const formConfig = useMemo(() => {
    const config: UseFormProps<TFormValues> = {
      ...formOptions,
      defaultValues,
      mode: showErrorsOnChange ? 'onChange' : 'onSubmit',
    };
    
    // Add schema validation if provided
    if (schema) {
      config.resolver = zodResolver(schema);
    }
    
    // Add debounced validation
    if (debounceValidation > 0) {
      config.criteriaMode = 'firstError';
      config.delayError = debounceValidation;
    }
    
    return config;
  }, [defaultValues, schema, formOptions, showErrorsOnChange, debounceValidation]);
  
  // Initialize form
  const methods = useForm<TFormValues>(formConfig);
  
  // Handle form submission with performance tracking
  const handleSubmit = async (data: TFormValues) => {
    startPerformanceMarker('form-submission');
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      endPerformanceMarker('form-submission', true);
    }
  };
  
  // Handle form errors
  const handleError = (errors: any) => {
    if (onError) {
      onError(errors);
    }
  };
  
  return (
    <FormProvider {...methods}>
      <form
        id={id}
        onSubmit={methods.handleSubmit(handleSubmit, handleError)}
        {...formProps}
        className={className}
        noValidate
      >
        {typeof children === 'function' ? children(methods) : children}
      </form>
    </FormProvider>
  );
}

export default OptimizedForm; 