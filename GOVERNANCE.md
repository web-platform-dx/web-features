# `web-features` governance

`web-platform-dx/web-features` is an open source project that depends on contributions from the community.
As long as they abide by the [W3C Code of Ethics and Professional Conduct](https://www.w3.org/Consortium/cepc/) (CEPC), anyone may contribute to the project at any time by submitting code, participating in discussions, making suggestions, or any other contribution they see fit.
This document describes how various types of contributors work within the project and how decisions are made.

## Roles and responsibilities

### Community members

Everyone who is involved in any form with the project must abide by the [CEPC](https://www.w3.org/Consortium/cepc/).
Everyone is expected to be respectful of fellow community members and to work collaboratively.
Consequences for not adhering to the CEPC are described in the linked document.

### Users

_Users_ are community members who have a need for the project.
They are typically consumers of data, packages, or other products of the project.
Anyone can be a _User_; common _User_ contributions include promoting the project (e.g., display a link on a website and raise awareness through word-of-mouth), informing developers of strengths and weaknesses from a new user perspective, or providing moral support (a “thank you” goes a long way).

_Users_ who continue to engage with the project and its community will often become more and more involved.
Such _Users_ may find themselves becoming [Contributors](#contributors), as described in the next section.

### Contributors

_Contributors_ are community members who contribute in concrete ways to the project, most often in the form of data updates, code, and/or documentation.
Anyone can become a _Contributor_, and contributions can take many forms.
There is no expectation of commitment to the project, no specific skill requirements, and no selection process.
We do expect contributors to follow the CEPC.

Contributors:

- Have read-only access to source code and therefore can submit changes via pull requests.
- Have their contribution reviewed and merged by a [Peer](#peers) or [Owner](#owners).
  _Owners_ and _Peers_ work with _Contributors_ to review their code and prepare it for merging.
- May also review pull requests.
  This can be helpful, but their approval or disapproval is not decisive for merging or not merging PRs.

As _Contributors_ gain experience and familiarity with the project, their profile within, and commitment to, the community will increase.
At some stage, they may find themselves being nominated for becoming a _Peer_ by an existing _Peer_ or _Owner_.

### Peers

_Peers_ are community members who have shown that they are committed to the continued development of the project through ongoing engagement with the community.
_Peers_ are given push/write access to the project’s GitHub repository.

Peers:

- Must follow documented contribution guidelines.
- Must submit pull requests for all their changes.
- May label and close issues.
- May merge pull requests that add or modify feature descriptions (excluding changes to a feature’s Baseline status or other availability status information).
  - Other contributors’ pull requests may be merged by _Peers_.
  - A _Peer_'s own pull requests may be merged after approval from a fellow _Peer_ or _Owner_.
- Must have their status, infrastructure, and documentation work reviewed and merged by [Owners](#owners).
  - Such pull requests change Baseline and other statuses, schemas, project direction-setting documentation, code files, and configuration files, or any change that would result in a [Semantic Versioning MAJOR](https://semver.org/) release.
- Should ask for additional review from other _Peers_ or _Owners_ on others' PRs that are disruptive or controversial.

To become a _Peer_ one must:

- Have shown a willingness and ability to participate in the project in a helpful and collaborative way with other participants.
- Have shown that they have an understanding of and alignment with the project, its objectives, and its strategy.
- Have contributed a significant amount of work to the project (e.g. in the form of PRs or PR reviews), thereby demonstrating their trustworthiness and commitment to the project.

New _Peers_ can be nominated by any existing _Peers or Owners_. Once they have been nominated, there will be a vote by the _Owners_.
The _Owners_ hear nominations and vote on nominees in a private setting.
A majority vote (see [Decision making](#decision-making)) confirms a nominee.
If a nominee is confirmed, then the _Owners_ group extends an invitation to join the _Peers_ group to the nominee
If the nominee accepts the invitation, then the _Owners_ group adds the _Peer_’s name to the [List of current Peers](#list-of-current-peers).

It is important to recognize that being a _Peer_ is a privilege, not a right.
That privilege must be earned and once earned it can be removed by the _Owners_.
However, under normal circumstances the _Peer_ status exists for as long as the _Peer_ wishes to continue engaging with the project.
Inactive _Peers_ (no activity on the project for months or more) might be marked as inactive or removed by the _Owners_ and may re-enter when they choose to contribute again.

#### List of current Peers

- (This list is currently empty.)

A _Peer_ who shows an above-average level of contribution to the project, particularly with respect to its strategic direction and long-term health, may be nominated to become an _Owner_, described below.

### Owners

The project is governed by the [Owners group](#list-of-current-owners) in consultation with the [Peers group](#list-of-current-peers) and the [WebDX Community Group](https://www.w3.org/community/webdx/).
_Owners_ are collectively responsible for high-level guidance of the project.

The _Owners_ group has final authority over:

- Adoption or amendment to the definition of Baseline
- Adoption or amendment to the definition of other feature availability statuses
- Technical direction of the project, especially infrastructure and schema decisions
- Project governance and process (including this policy and any updates)
- Confirming _Peers_ and _Owners_
- Contribution policy
- GitHub repository hosting

Being an _Owner_ is not time-limited.
There is no fixed size of the _Owner_ group.
The _Owner_ group should be of such a size as to ensure adequate coverage of important areas of expertise balanced with the ability to make decisions efficiently.
An _Owner_ may be removed from the _Owner_ group by voluntary resignation, or by a standard _Owner_ group motion, including for violations of the CEPC or other contribution requirements as described in the project’s contribution documentation.

Changes to the _Owner_ group should be posted in the agenda, and may be suggested as any other agenda item (see [Project meetings](#project-meetings)).

_Owners_ fulfill all requirements of _Peers_, and also:

- Must ensure the smooth running of the project.
- Should review code contributions, changes to this document, or changes to the licensing of the project or its outputs.
- May merge pull requests that remove feature descriptions.
- May merge pull requests that change the Baseline definition or its implementation.
- May merge pull requests that change Baseline statuses.
- May merge pull requests that change other availability statuses.
- May merge pull requests that change project documentation or infrastructure.
- May merge pull requests that result in a [Semantic Versioning MAJOR](https://semver.org/) release.
- Should release package(s) on a regular basis (or review and approve automation with the same effect).

To become an _Owner_ one must fulfill at least the following conditions and commit to being a part of the community for the long-term:

- Have worked in a helpful and collaborative way with the WebDX community.
- Have given good feedback on others’ submissions and displayed an overall understanding of the code quality standards for the project.
- Have the ability to drive the project forward, manage requirements from users, and take on responsibility for the overall health of the project.

See also: [Additional paths to becoming a Peer or Owner](#additional-paths-to-becoming-a-peer-or-owner)

New _Owners_ can be nominated by existing _Owners_.
Once they have been nominated, there will be a vote by the _Owners_.
The _Owners_ hear nominations and vote on nominees in a private setting.
A majority vote (see [Decision making](#decision-making)) confirms a nominee.
If a nominee is confirmed, then the _Owners_ group extends an invitation to join the _Owners_ group to the nominee.
If the nominee accepts the invitation, then the _Owners_ group adds the new _Owner_’s name to the [List of current Owners](#list-of-current-owners).

#### List of current Owners

- Dan Fabulich (@dfabulich)
- Daniel D. Beck (@ddbeck)
- Florian Scholz (@Elchi3)
- Kadir Topal (@atopal)
- Leo McArdle (@LeoMcA)

## Additional paths to becoming a Peer or Owner

The Owners group may, at their discretion, invite domain experts or key consumers of the project to become Peers or Owners.
For example, a representative from a browser vendor may be invited to give their input on Baseline statuses or a representative from Can I use…? may be invited to give their input on how project decisions might impact readers of Can I use…?.
Such Peers and Owners are indicated in the Peers or Owners list with the text “invited representative for” followed by the name of the applicable organization or interest group.

## Owner-delegate rule

_Owners_ may, at their discretion, nominate an owner-delegate to carry out a task or make a decision ordinarily carried out by an _Owner_ or _Peer_.
Delegation should be limited in duration or scope, or both; delegation may be withdrawn by any _Owner_ at any time.
For example, an _Owner_ may nominate a tool expert as an owner-delegate to approve an infrastructure PR or nominate a feature expert as an owner-delegate to approve a feature description.

## Decision making

Decision making follows a [consensus-seeking decision-making](https://en.wikipedia.org/wiki/Consensus-seeking_decision-making) model, which encourages participants to exhaust attempts to achieve true consensus before falling back to a vote.
Votes, if required, take place at [project meetings](#project-meetings).

When an agenda item has appeared to reach a consensus, the chair will ask “Does anyone object?” as a final call for dissent from the consensus.

If an agenda item cannot reach a consensus, an _Owner_ can call for either a closing vote or a vote to defer the issue to the next meeting.
The call for a vote must be approved by a majority of the _Owners_ or else the discussion will continue.
Simple majority wins.

Whether by consensus or vote, whenever the _Owners_ make a collective decision, they commit to memorializing that decision in writing (e.g., through the creation or modification of a document, a comment on a pull request, issue, or discussion, or through some other durable record).

## Project meetings

The _Owners_ commit to meeting on a quarterly basis, or more often as needed, on a schedule and duration to be determined by the _Owners_ group.

The meeting is run by a designated chair selected by the _Owners_ group.
Meetings will typically tend to important or unresolved matters, such as modifications of governance, contribution policy, project membership, or release process.

Any community member or _Peer_ can ask that something be added to the next meeting’s agenda by logging a GitHub Issue.
_Peers_ can add the item to the agenda by adding the [meeting-agenda](https://github.com/web-platform-dx/feature-set/labels/meeting-agenda) label to the issue and _Contributors_ can ask _Peers_ or _Owners_ to add the label for them (though they’re not obliged to accept the request).

The intention of the agenda is not to approve or review all patches.
That should happen continuously on GitHub and be handled by the larger group of Peers.
The exception to this is when a PR discussion has stalled due to disagreement or inaction, and progress needs to be unblocked.

Before each project meeting, the chair will share the agenda with the _Owners and Peers_.
_Owners_ can add any items they like to the agenda at or before the beginning of each meeting.
The chair (or other _Owners_) cannot veto or remove items, except by unanimous consent of the _Owners_.
Agenda items not addressed by the end of the meeting are automatically deferred to the next meeting.

The _Owners_ may invite _Peers_ or other guests to participate in a non-voting capacity.

The chair is responsible for summarizing the discussion of each agenda item and adding it to the repository after the meeting.

## Privileges and responsibilities matrix

<table>
  <thead>
  <tr>
   <th>Privilege / responsibility
   </td>
   <th>Everyone / Users
   </td>
   <th>Contributors
   </td>
   <th>Peers
   </td>
   <th>Owners
   </td>
  </tr>
  </thead>
  <tbody>
  <tr>
   <td>Abide by the CEPC
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Promoting the project
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Make use of the data, fork it, repackage it, etc.
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Open pull requests or issues
   </td>
   <td>
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Review pull requests or comment on issues
   </td>
   <td>
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Label issues and PRs
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Merge new or modified feature descriptions
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Merge policy changes
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Merge schema or infrastructure changes
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Merge changes to a feature’s status
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Merge removal of a feature
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Release new npm package versions
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Adopt or modify the Baseline definition
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Adopt or modify other status definitions
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
  </tr>
  <tr>
   <td>Merge to branches directly (without pull requests)
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>Yes
   </td>
  </tr>
  </tbody>
</table>

<!--
## Peers and owners emeriti

The project would like to thank the following former Owners and Peers for their contributions and the countless hours invested.

* (This list is currently empty.)
-->

## Credits

This work is a derivative of [mdn/browser-compat-data Governance](https://github.com/mdn/browser-compat-data/blob/main/GOVERNANCE.md), [ESLint Governance](https://github.com/eslint/eslint.github.io/blob/master/docs/maintainer-guide/governance.md), [YUI Contributor Model](https://github.com/yui/yui3/wiki/Contributor-Model), and the [JS Foundation TAC Charter](https://github.com/JSFoundation/TAC).
