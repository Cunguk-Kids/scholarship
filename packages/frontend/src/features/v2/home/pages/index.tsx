function Button({  ...props }: React.ComponentProps<"button">) {
  const Comp = "button";

  return (
    <Comp
      data-slot="button"
      className={
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
      }
      {...props}
    />
  );
}

export const HomePage = () => {
  return (
    <div
      className="min-h-screen font-nunito"
      style={{ backgroundColor: "#fcf0e3" }}
    >

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div
          className="absolute top-20 left-10 w-20 h-20 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          style={{ backgroundColor: "#ff7989" }}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: "#f55f4b" }}
            ></div>
          </div>
        </div>

        <div className="absolute top-32 right-20 w-16 h-16 rotate-12">
          <div
            className="w-full h-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: "#d9fbb0" }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: "#6a88f8" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            {/* Left Illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-80 h-96 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-3xl p-8 transform -rotate-3">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full border-4 border-black mb-6"
                      style={{ backgroundColor: "#fcd343" }}
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div
                          className="w-16 h-16 rounded-full"
                          style={{ backgroundColor: "#ff7989" }}
                        ></div>
                      </div>
                    </div>
                    <div
                      className="w-32 h-20 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      style={{ backgroundColor: "#f55f4b" }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Content */}
            <div className="text-center">
              <h1 className="text-6xl lg:text-7xl font-black mb-8 leading-tight font-paytone">
                Empower the Future.
                <br />
                <span className="block mt-4">or Be Empowered.</span>
              </h1>

              <div className="space-y-4 text-xl font-semibold text-gray-800 mb-12">
                <p>All scholarships are powered by smart contracts.</p>
                <p>Funds go directly to students, no middlemen.</p>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-80 h-96 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-3xl p-8 transform rotate-3">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full border-4 border-black mb-6"
                      style={{ backgroundColor: "#6a88f8" }}
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div
                      className="w-32 h-20 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      style={{ backgroundColor: "#ff7989" }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Yellow Section */}
        <div className="relative">
          <div className="absolute inset-0 transform rotate-1">
            <div
              className="w-full h-64 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              style={{ backgroundColor: "#fcd343" }}
            ></div>
          </div>
          <div className="relative z-10 py-20">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8 font-paytone">
                Looking for a fair, transparent way to fund your education?
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="px-8 py-4 text-white font-bold text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                  style={{ backgroundColor: "#6a88f8" }}
                >
                  Apply for Scholarship
                </Button>
                <Button
                  className="px-8 py-4 text-white font-bold text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                  style={{ backgroundColor: "#f55f4b" }}
                >
                  Fund Students
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 font-paytone">
              How SkoolCein Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div
                  className="w-24 h-24 mx-auto mb-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#6a88f8" }}
                >
                  <span className="text-3xl font-bold text-white font-paytone">
                    1
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-paytone">
                  Students Apply
                </h3>
                <p className="text-lg text-gray-700">
                  Students submit their scholarship applications with academic
                  records and project proposals directly on the blockchain.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div
                  className="w-24 h-24 mx-auto mb-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#f55f4b" }}
                >
                  <span className="text-3xl font-bold text-white font-paytone">
                    2
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-paytone">
                  DAO Votes
                </h3>
                <p className="text-lg text-gray-700">
                  Community members and stakeholders vote on applications using
                  transparent, decentralized governance protocols.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div
                  className="w-24 h-24 mx-auto mb-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#fcd343" }}
                >
                  <span className="text-3xl font-bold text-black font-paytone">
                    3
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-paytone">
                  Funds Released
                </h3>
                <p className="text-lg text-gray-700">
                  Smart contracts automatically release funds to approved
                  students, ensuring transparency and eliminating middlemen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6" style={{ backgroundColor: "#d9fbb0" }}>
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 font-paytone">
              Why Choose SkoolCein?
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl">
                <div
                  className="w-16 h-16 mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#6a88f8" }}
                >
                  <div className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-paytone">
                  Transparent Voting
                </h3>
                <p className="text-gray-700">
                  Every vote is recorded on the blockchain for complete
                  transparency and accountability.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl">
                <div
                  className="w-16 h-16 mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#f55f4b" }}
                >
                  <div className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-paytone">
                  Direct Funding
                </h3>
                <p className="text-gray-700">
                  Funds go directly to students without intermediaries, reducing
                  costs and delays.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl">
                <div
                  className="w-16 h-16 mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#fcd343" }}
                >
                  <div className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-paytone">
                  Real-time Tracking
                </h3>
                <p className="text-gray-700">
                  Track scholarship progress and fund utilization in real-time
                  on the dashboard.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl">
                <div
                  className="w-16 h-16 mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#ff7989" }}
                >
                  <div className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-paytone">
                  Secure Payments
                </h3>
                <p className="text-gray-700">
                  All transactions are secured by blockchain technology and
                  smart contracts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 font-paytone">
              Our Impact
            </h2>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div
                  className="text-6xl font-bold mb-4 font-paytone"
                  style={{ color: "#6a88f8" }}
                >
                  2,847
                </div>
                <p className="text-xl font-semibold text-gray-800">
                  Students Funded
                </p>
              </div>

              <div className="text-center">
                <div
                  className="text-6xl font-bold mb-4 font-paytone"
                  style={{ color: "#f55f4b" }}
                >
                  $12.4M
                </div>
                <p className="text-xl font-semibold text-gray-800">
                  Total Distributed
                </p>
              </div>

              <div className="text-center">
                <div
                  className="text-6xl font-bold mb-4 font-paytone"
                  style={{ color: "#fcd343" }}
                >
                  156
                </div>
                <p className="text-xl font-semibold text-gray-800">
                  Active Scholarships
                </p>
              </div>

              <div className="text-center">
                <div
                  className="text-6xl font-bold mb-4 font-paytone"
                  style={{ color: "#ff7989" }}
                >
                  94%
                </div>
                <p className="text-xl font-semibold text-gray-800">
                  Success Rate
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6" style={{ backgroundColor: "#ff7989" }}>
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 text-white font-paytone">
              Student Success Stories
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full border-4 border-black mr-4"
                    style={{ backgroundColor: "#6a88f8" }}
                  ></div>
                  <div>
                    <h4 className="font-bold text-lg font-paytone">
                      Sarah Chen
                    </h4>
                    <p className="text-gray-600">Computer Science, MIT</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "SkoolCein made my dream of studying at MIT possible. The
                  transparent process gave me confidence, and receiving funds
                  directly was incredibly efficient."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full border-4 border-black mr-4"
                    style={{ backgroundColor: "#fcd343" }}
                  ></div>
                  <div>
                    <h4 className="font-bold text-lg font-paytone">
                      Marcus Johnson
                    </h4>
                    <p className="text-gray-600">Engineering, Stanford</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The DAO voting system ensured fair selection. I'm grateful to
                  the community that believed in my potential and funded my
                  education."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full border-4 border-black mr-4"
                    style={{ backgroundColor: "#d9fbb0" }}
                  ></div>
                  <div>
                    <h4 className="font-bold text-lg font-paytone">
                      Priya Patel
                    </h4>
                    <p className="text-gray-600">Medicine, Harvard</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "No paperwork delays, no bureaucracy. Just a fair, transparent
                  system that helped me pursue my medical degree. Thank you,
                  SkoolCein!"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl font-bold text-center mb-16 font-paytone">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {/* FAQ 1 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-2xl">
                <h3
                  className="text-2xl font-bold mb-4 font-paytone"
                  style={{ color: "#6a88f8" }}
                >
                  How does DAO voting work?
                </h3>
                <p className="text-gray-700 text-lg">
                  Community members stake tokens to participate in voting. Each
                  scholarship application is reviewed and voted on
                  transparently. The voting power is distributed among
                  stakeholders, ensuring fair and democratic decision-making.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-2xl">
                <h3
                  className="text-2xl font-bold mb-4 font-paytone"
                  style={{ color: "#f55f4b" }}
                >
                  What are the eligibility requirements?
                </h3>
                <p className="text-gray-700 text-lg">
                  Students must be enrolled or accepted into accredited
                  institutions, maintain good academic standing, and demonstrate
                  financial need. Each scholarship may have specific
                  requirements set by the funding organization.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-2xl">
                <h3
                  className="text-2xl font-bold mb-4 font-paytone"
                  style={{ color: "#fcd343" }}
                >
                  How are funds distributed?
                </h3>
                <p className="text-gray-700 text-lg">
                  Once approved by DAO vote, smart contracts automatically
                  release funds to students' wallets. Funds can be distributed
                  in installments based on academic milestones or all at once,
                  depending on the scholarship terms.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-2xl">
                <h3
                  className="text-2xl font-bold mb-4 font-paytone"
                  style={{ color: "#ff7989" }}
                >
                  Can I become a scholarship provider?
                </h3>
                <p className="text-gray-700 text-lg">
                  Yes! Anyone can create and fund scholarships on SkoolCein.
                  Simply connect your wallet, set your criteria, deposit funds,
                  and let the community vote on deserving candidates. You
                  maintain full control over your scholarship parameters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6" style={{ backgroundColor: "#6a88f8" }}>
          <div className="container mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-8 font-paytone">
              Ready to Transform Education Funding?
            </h2>
            <p className="text-xl text-white mb-12 max-w-3xl mx-auto">
              Join thousands of students and providers who are already using
              SkoolCein to make education more accessible and transparent.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                className="px-10 py-5 text-black font-bold text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                style={{ backgroundColor: "#fcd343" }}
              >
                Start Your Application
              </Button>
              <Button className="px-10 py-5 text-white font-bold text-xl border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all bg-transparent">
                Become a Provider
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-full border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                  style={{ backgroundColor: "#6a88f8" }}
                >
                  <div className="w-6 h-6 text-white m-3" />
                </div>
                <h3 className="text-2xl font-bold font-paytone">SkoolCein</h3>
              </div>
              <p className="text-gray-300 text-lg mb-6">
                Empowering the future of education through blockchain technology
                and decentralized governance. Making scholarships transparent,
                fair, and accessible to all.
              </p>
              <div className="flex gap-4">
                <div
                  className="w-12 h-12 border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-lg flex items-center justify-center cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
                  style={{ backgroundColor: "#6a88f8" }}
                >
                  <span className="text-white font-bold">T</span>
                </div>
                <div
                  className="w-12 h-12 border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-lg flex items-center justify-center cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
                  style={{ backgroundColor: "#f55f4b" }}
                >
                  <span className="text-white font-bold">D</span>
                </div>
                <div
                  className="w-12 h-12 border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-lg flex items-center justify-center cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
                  style={{ backgroundColor: "#fcd343" }}
                >
                  <span className="text-black font-bold">G</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6 font-paytone">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Scholarships
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Vote
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xl font-bold mb-6 font-paytone">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 SkoolCein. All rights reserved. Built with ❤️ for the
              future of education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
