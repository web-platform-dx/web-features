# Audience illustration for Baseline status

> [!NOTE]  
> This section was previously part of the [Baseline definition document](baseline.md).
> It's preserved here to help web-features and Baseline contributors understand the audience and applications of Baseline and underlying web-features data.

Although Baseline is intended for web developers, “web developers” is an extremely broad category, which includes ranges of experience, goals, and motivations.
It’s hard to make tools for a broad category.
Instead, we can use a more specific example as a proxy for the group as a whole.

The audience for Baseline status is illustrated through the following story.
This is but one of several possible stories to help keep in mind the needs and constraints of web developers who use Baseline.

> A web developer is responsible for the maintenance of a static site generator.
>
> The application is typically used in a self-hosted manner: other, downstream web developers download, install, and run the application themselves.
> The downstream developers rarely contribute to the application’s source code or documentation and even less rarely contribute funds for ongoing development.
> But they are generous with bug reports and complaints.
>
> The developer needs to make browser support decisions that work for them, for downstream developers (the site generator users), and for _their_ users (end users).
> The developer wants to maximize backwards compatibility and minimize complaints from downstream developers about browser support issues.
>
> But the developer has several constraints that influence their day-to-day decisions about whether to use a given web platform feature:
>
> * The developer does not have access to downstream developers’ analytics and they don't use telemetry in the application itself, so they can’t directly know anything about end users’ browsers.
> * The developer has limited time and budget to get relatively old or new devices and test with.
>   They use a 2-year old laptop that they keep _mostly_ up-to-date with OS and browser updates.
> * The developer has limited time and interest to keep up with browser news.
>   They don’t routinely read web development blogs.
> * The developer recently decided to stop worrying about end-of-life browsers.
>
> Today, to decide whether to use a new-to-them web platform feature, the developer uses the same techniques taught by their mentors: skim _Can I use…?_ and MDN browser compatibility tables.
> They mostly work on a gut feeling: is there _enough_ green in the table to use this feature?
> This works some of the time, but they’ve been occasionally surprised by both “new” (and unfamiliar) features being long-supported and unexpected complaints of incompatibility.