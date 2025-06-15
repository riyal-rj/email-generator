import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { Loader2, Mail, Copy, Sparkles, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';


const Index = () => {
  const [emailContent, setEmailContent] = useState<string>('');
  const [tone, setTone] = useState<string>('');
  const [generatedReply, setGeneratedReply] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!emailContent.trim()) {
      toast.error("Please enter the original email content to generate a reply.");
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);
    
    try {
      const response: AxiosResponse<string> = await axios.post('http://localhost:8080/api/v1/email/generate', {
        emailContent,
        tone: tone && tone !== 'none' ? tone : undefined,
      });
      setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
      toast.success("Reply generated successfully!");
    } catch (error: unknown) {
      const errorMessage = 'Failed to generate email reply. Please check your connection and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedReply);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard. Please select and copy manually.");
    }
  };

  const clearForm = () => {
    setEmailContent('');
    setTone('');
    setGeneratedReply('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Email Reply Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate professional email replies instantly using AI. Simply paste your email and choose a tone.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Compose Your Reply
              </CardTitle>
              <CardDescription>
                Enter the original email content and select your preferred tone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-content" className="text-sm font-medium">
                  Original Email Content *
                </Label>
                <Textarea
                  id="email-content"
                  className="min-h-[200px] resize-none border-2 focus:border-blue-500 transition-colors"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Paste the email you want to reply to here..."
                />
                <p className="text-xs text-muted-foreground">
                  {emailContent.length}/2000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone" className="text-sm font-medium">
                  Response Tone
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone" className="border-2 focus:border-blue-500">
                    <SelectValue placeholder="Choose your tone (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="none">No specific tone</SelectItem>
                    <SelectItem value="professional">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Professional</Badge>
                        <span>Formal and business-like</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="casual">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Casual</Badge>
                        <span>Relaxed and informal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friendly">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Friendly</Badge>
                        <span>Warm and approachable</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  onClick={handleSubmit}
                  disabled={!emailContent.trim() || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Reply
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearForm}
                  disabled={loading}
                  className="border-2"
                >
                  Clear
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                Generated Reply
              </CardTitle>
              <CardDescription>
                Your AI-generated email reply will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedReply ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Generated Email Reply</Label>
                      {tone && tone !== 'none' && (
                        <Badge variant="outline" className="capitalize">
                          {tone} tone
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      className="min-h-[200px] resize-none border-2 bg-gray-50 focus:bg-white transition-colors"
                      value={generatedReply}
                      readOnly
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full border-2 hover:bg-green-50 hover:border-green-300 transition-all"
                    onClick={handleCopyToClipboard}
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Mail className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reply generated yet
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Enter your email content and click "Generate Reply" to see your AI-powered response here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">Advanced AI generates contextual and relevant replies</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-2">Multiple Tones</h3>
              <p className="text-sm text-gray-600">Choose from professional, casual, or friendly tones</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Copy className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Easy Copy</h3>
              <p className="text-sm text-gray-600">One-click copy to clipboard for instant use</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
