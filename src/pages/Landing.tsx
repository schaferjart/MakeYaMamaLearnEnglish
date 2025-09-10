import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Volume2, MessageSquare, BarChart3, Play, Pause, Star, ArrowRight, Users, Award, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const demoText = `"Drawing the door towards him" means he pulled the door in his direction to close it. In this scene, Raskolnikov is trying to prevent the old woman from shutting the door by keeping it open.`;

const demoWords = [
  { word: "drawing", definition: "pulling or moving something", difficulty: "intermediate" },
  { word: "towards", definition: "in the direction of", difficulty: "basic" },
  { word: "prevent", definition: "to stop something from happening", difficulty: "advanced" }
];

export default function Landing() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "What did Raskolnikov do to keep the old woman from shutting the door?" },
    { role: "user", text: "He drew the door towards him..." }
  ]);
  const [newMessage, setNewMessage] = useState("");
  
  const navigate = useNavigate();

  const handlePlayDemo = () => {
    setIsPlaying(!isPlaying);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleWordSelect = (word: string) => {
    setSelectedWord(selectedWord === word ? null : word);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, { role: "user", text: newMessage }]);
      setNewMessage("");
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: "ai", text: "Great question! Let me explain that for you..." }]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-5"></div>
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BookOpen className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold text-primary">MamaLearnEnglish</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master English through interactive reading, vocabulary building, and AI-powered conversations. 
            Experience the future of language learning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">10,000+ Learners</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">95% Success Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Available Worldwide</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4" onClick={() => navigate('/auth')}>
              Start Learning Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              Watch Demo
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demos */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Experience Our Learning Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Try our interactive demos and see how we make English learning engaging and effective
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Reading Demo */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Interactive Reading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-reading-focus rounded-lg border-2 border-dashed border-border">
                <p className="text-base leading-relaxed">
                  {demoText.split(' ').map((word, index) => (
                    <span 
                      key={index}
                      className={`cursor-pointer hover:bg-vocabulary-highlight rounded px-1 transition-colors ${
                        isPlaying && index < 8 ? 'bg-audio-sync text-foreground font-medium' : ''
                      }`}
                      onClick={() => handleWordSelect(word.replace(/[.,]/g, ''))}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  size="sm" 
                  variant={isPlaying ? "secondary" : "default"}
                  onClick={handlePlayDemo}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play Audio'}
                </Button>
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: isPlaying ? '100%' : '0%' }}
                  />
                </div>
              </div>

              <Badge variant="secondary" className="w-fit">
                Click words to save them to your vocabulary!
              </Badge>
            </CardContent>
          </Card>

          {/* Vocabulary Demo */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-accent" />
                Smart Vocabulary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedWord ? (
                <div className="p-4 bg-vocabulary-highlight rounded-lg border border-accent/20">
                  <h4 className="font-bold text-vocabulary-highlight-foreground capitalize">{selectedWord}</h4>
                  <p className="text-sm text-vocabulary-highlight-foreground mt-1">
                    {demoWords.find(w => w.word === selectedWord)?.definition || "Definition will appear here"}
                  </p>
                  <Badge className="mt-2">
                    {demoWords.find(w => w.word === selectedWord)?.difficulty || "intermediate"}
                  </Badge>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Select a word from the text above to see its definition</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Your Vocabulary Progress</h4>
                <div className="space-y-3">
                  {demoWords.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.word}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(index + 1) * 33} className="w-20" />
                        <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}>
                          {index === 0 ? "Mastered" : index === 1 ? "Learning" : "New"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Tutor Demo */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-success" />
                AI Conversation Tutor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="h-64 bg-muted/30 rounded-lg p-4 overflow-y-auto space-y-3">
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-card border text-card-foreground'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ask about the story..."
                      className="flex-1 px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="sm" onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">AI Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">✓</Badge>
                      <div>
                        <p className="font-medium text-sm">Contextual Explanations</p>
                        <p className="text-xs text-muted-foreground">Get explanations based on what you're reading</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">✓</Badge>
                      <div>
                        <p className="font-medium text-sm">Grammar Help</p>
                        <p className="text-xs text-muted-foreground">Understand complex grammar structures</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">✓</Badge>
                      <div>
                        <p className="font-medium text-sm">Cultural Context</p>
                        <p className="text-xs text-muted-foreground">Learn about cultural references and meanings</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Learning Progress</span>
                    </div>
                    <Progress value={78} className="mb-2" />
                    <p className="text-xs text-muted-foreground">You've improved 78% in conversational English!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-y">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your English Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already improving their English with our interactive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4" onClick={() => navigate('/auth')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">MamaLearnEnglish</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 MamaLearnEnglish. Making English learning accessible for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}