import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCreateReport, useUploadReportImage } from '@/hooks/useReports';
import { useBins } from '@/hooks/useBins';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  MapPin, 
  Send, 
  Loader2, 
  CheckCircle,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const wasteTypes = ['Dry', 'Wet', 'Mixed', 'Hazardous'] as const;
const severities = ['Low', 'Medium', 'High', 'Critical'] as const;

const ReportWaste = () => {
  const createReport = useCreateReport();
  const uploadImage = useUploadReportImage();
  const { data: bins } = useBins();
  
  const [formData, setFormData] = useState({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    description: '',
    waste_type: '' as typeof wasteTypes[number] | '',
    severity: 'Medium' as typeof severities[number],
    address: '',
    ward: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadImage.mutateAsync(imageFile);
      }

      // Create report
      await createReport.mutateAsync({
        reporter_name: formData.reporter_name,
        reporter_email: formData.reporter_email || null,
        reporter_phone: formData.reporter_phone || null,
        description: formData.description,
        waste_type: formData.waste_type as typeof wasteTypes[number] || null,
        severity: formData.severity,
        address: formData.address || null,
        ward: formData.ward || null,
        image_url: imageUrl,
      });

      setSuccess(true);
      toast.success('Report submitted successfully!');
      
      // Reset form
      setFormData({
        reporter_name: '',
        reporter_email: '',
        reporter_phone: '',
        description: '',
        waste_type: '',
        severity: 'Medium',
        address: '',
        ward: '',
      });
      setImageFile(null);
      setImagePreview(null);
      
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
              <h2 className="text-xl font-bold mb-2">Report Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for reporting this issue. Our team will review it shortly.
              </p>
              <Button onClick={() => setSuccess(false)}>
                Submit Another Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Report Waste Issue</h1>
          <p className="text-muted-foreground">Help keep our city clean by reporting waste problems</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Reporter Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.reporter_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, reporter_name: e.target.value }))}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.reporter_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, reporter_email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.reporter_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporter_phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Issue Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Issue Details
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the waste problem you're reporting..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waste-type">Waste Type</Label>
                    <Select 
                      value={formData.waste_type}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, waste_type: v as typeof wasteTypes[number] }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity *</Label>
                    <Select 
                      value={formData.severity}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, severity: v as typeof severities[number] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {severities.map(sev => (
                          <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Location/Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter the location of the issue"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Photo Evidence
                </h3>
                
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ReportWaste;
